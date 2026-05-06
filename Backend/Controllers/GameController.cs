using Entities.Dtos;
using Entities.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Repositories;
using Services;

namespace MyApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
{
    private readonly DictionaryService _dictionaryService;
    private readonly GridGeneratorService _gridGeneratorService;
    private readonly ScoreCalculator _scoreCalculator;
    private readonly GravityService _gravityService;
    private readonly GridScannerService _gridScanner;
    private readonly IMemoryCache _cache;

    public GameController(
        DictionaryService dictionaryService,
        GridGeneratorService gridGeneratorService,
        ScoreCalculator scoreCalculator,
        GravityService gravityService,
        IMemoryCache cache,
        GridScannerService gridScanner)
    {
        _dictionaryService = dictionaryService;
        _gridGeneratorService = gridGeneratorService;
        _scoreCalculator = scoreCalculator;
        _gravityService = gravityService;
        _cache = cache;
        _gridScanner = gridScanner;
    }

        [HttpGet("Generate-Grid/{size}")]
        public IActionResult GenerateGrid(int size)
        {
            if (size != 6 && size != 8 && size != 10)
                return BadRequest("Sadece 6, 8 veya 10 boyutunda grid seçilebilir!");

            char[,] grid = _gridGeneratorService.GenerateGrid(size);
            int validWordCount = _gridScanner.CalculatePlayableWordCount(grid);

            string gameId = Guid.NewGuid().ToString();
            _cache.Set(gameId, grid, TimeSpan.FromHours(1));

            return Ok(new { 
                gameId = gameId, 
                size = size, 
                grid = grid.Cast<char>().ToArray(),
                validWordCount = validWordCount 
            });
        }

    [HttpPost("use-joker")]
    public IActionResult UseJoker([FromBody] JokerRequestDto request)
    {
        if (!_cache.TryGetValue(request.GameId, out char[,] currentGrid))
            return BadRequest(new { success = false, message = "Oyun bulunamadı" });

        int size = currentGrid.GetLength(0);

        // Joker Algoritmaları
        if (request.JokerType == "Lolipop")
        {
            if (request.Target != null)
                currentGrid = _gravityService.ApplyGravity(currentGrid, new List<CoordinateDto> { request.Target });
        }
        else if (request.JokerType == "Balık")
        {
            var randomCoords = new List<CoordinateDto>();
            var rand = new Random();
            // Rastgele 3 harfi patlat
            for (int i = 0; i < 3; i++) randomCoords.Add(new CoordinateDto { Row = rand.Next(size), Col = rand.Next(size) });
            currentGrid = _gravityService.ApplyGravity(currentGrid, randomCoords);
        }
        else if (request.JokerType == "Serbest Değiştirme")
        {
            if (request.Target != null && request.Target2 != null)
            {
                char temp = currentGrid[request.Target.Row, request.Target.Col];
                currentGrid[request.Target.Row, request.Target.Col] = currentGrid[request.Target2.Row, request.Target2.Col];
                currentGrid[request.Target2.Row, request.Target2.Col] = temp;
            }
        }
        else if (request.JokerType == "Tekerlek")
        {
            var coords = new List<CoordinateDto>();
            for (int i = 0; i < size; i++)
            {
                coords.Add(new CoordinateDto { Row = request.Target.Row, Col = i }); // Satır
                coords.Add(new CoordinateDto { Row = i, Col = request.Target.Col }); // Sütun
            }
            currentGrid = _gravityService.ApplyGravity(currentGrid, coords);
        }
        else if (request.JokerType == "Karıştırma")
        {
            var flatGrid = currentGrid.Cast<char>().OrderBy(x => Guid.NewGuid()).ToList();
            int index = 0;
            for (int r = 0; r < size; r++)
                for (int c = 0; c < size; c++)
                    currentGrid[r, c] = flatGrid[index++];
        }
        else if (request.JokerType == "Parti Güçlendiricisi")
        {
            currentGrid = _gridGeneratorService.GenerateGrid(size); // Tüm tahtayı yenile
        }

        // Deadlock Kontrolü (Joker sonrası kelime kalmadıysa)
        int validWordCount = _gridScanner.CalculatePlayableWordCount(currentGrid);
        bool isReshuffled = false;
        
        if (validWordCount == 0)
        {
            // Önce karıştır
            var flatGrid = currentGrid.Cast<char>().OrderBy(x => Guid.NewGuid()).ToList();
            int idx = 0;
            for (int r = 0; r < size; r++)
                for (int c = 0; c < size; c++)
                    currentGrid[r, c] = flatGrid[idx++];
            
            validWordCount = _gridScanner.CalculatePlayableWordCount(currentGrid);
            isReshuffled = true;

            // Eğer karıştırınca da çıkmadıysa garantili yeni üret
            if (validWordCount == 0)
            {
                currentGrid = _gridGeneratorService.GenerateGrid(size);
                validWordCount = _gridScanner.CalculatePlayableWordCount(currentGrid);
            }
        }

        _cache.Set(request.GameId, currentGrid, TimeSpan.FromHours(1));

        return Ok(new
        {
            success = true,
            message = $"{request.JokerType} kullanıldı!",
            newGrid = currentGrid.Cast<char>().ToArray(),
            validWordCount = validWordCount,
            isReshuffled = isReshuffled
        });
    }

    [HttpPost("make-move")]
    public IActionResult MakeMove([FromBody] MoveRequestDto request)
    {
        if (!_cache.TryGetValue(request.GameId, out char[,] currentGrid))
            return BadRequest(new { success = false, message = "Oyun süresi doldu." });

        int size = currentGrid.GetLength(0);
        int gainedScore = 0;
        string comboStr = "";
        string specialPower = "Yok";

        // --- 1. ÖZEL GÜÇ PATLATMA KONTROLÜ (Tekli Tıklama) ---
        if (request.Coordinates.Count == 1)
        {
            var target = request.Coordinates[0];
            char symbol = currentGrid[target.Row, target.Col];
            var explosionCoords = new List<CoordinateDto>();

            if (symbol == '⇆') // Satır Temizleme
            {
                for (int c = 0; c < size; c++) explosionCoords.Add(new CoordinateDto { Row = target.Row, Col = c });
            }
            else if (symbol == '⇅') // Sütun Temizleme
            {
                for (int r = 0; r < size; r++) explosionCoords.Add(new CoordinateDto { Row = r, Col = target.Col });
            }
            else if (symbol == '✹') // Alan Patlatma (Komşular)
            {
                for (int r = target.Row - 1; r <= target.Row + 1; r++)
                    for (int c = target.Col - 1; c <= target.Col + 1; c++)
                        if (r >= 0 && r < size && c >= 0 && c < size)
                            explosionCoords.Add(new CoordinateDto { Row = r, Col = c });
            }
            else if (symbol == '✪') // Mega Patlatma (2 Birim Çapraz)
            {
                for (int r = target.Row - 2; r <= target.Row + 2; r++)
                    for (int c = target.Col - 2; c <= target.Col + 2; c++)
                        if (r >= 0 && r < size && c >= 0 && c < size)
                            explosionCoords.Add(new CoordinateDto { Row = r, Col = c });
            }

            if (explosionCoords.Count > 0)
            {
                currentGrid = _gravityService.ApplyGravity(currentGrid, explosionCoords);
                
                // Patlama sonrası deadlock kontrolü
                int currentValidWords = _gridScanner.CalculatePlayableWordCount(currentGrid);
                bool didReshuffle = false;
                
                if (currentValidWords == 0)
                {
                    currentGrid = _gridGeneratorService.GenerateGrid(size); // Direkt üret, patlamada tahta boşalabilir
                    currentValidWords = _gridScanner.CalculatePlayableWordCount(currentGrid);
                    didReshuffle = true;
                }

                _cache.Set(request.GameId, currentGrid, TimeSpan.FromHours(1));
                
                return Ok(new { 
                    success = true, 
                    gainedScore = 50, 
                    specialPowerGained = "Özel Güç Kullanıldı!", 
                    newGrid = currentGrid.Cast<char>().ToArray(),
                    validWordCount = currentValidWords,
                    isReshuffled = didReshuffle
                });
            }
        }

        // --- 2. NORMAL KELİME KONTROLÜ ---
        if (string.IsNullOrWhiteSpace(request.Word) || request.Word.Length < 3)
            return BadRequest(new { success = false, message = "Geçersiz Kelime" });

        if (!_dictionaryService.IsWordValid(request.Word))
            return Ok(new { success = false, message = "Sözlükte bulunamadı!" });

        // Skor hesapla
        var result = _scoreCalculator.CalculateComvoAndScore(request.Word);
        gainedScore = result.TotalScore;
        comboStr = $"{result.ComboCount}x Combo!";

        // --- 3. YENİ ÖZEL GÜÇ ÜRETİMİ ---
        char symbolToLeave = '\0';
        if (request.Word.Length == 4) { symbolToLeave = '⇆'; specialPower = "Satır Simgesi Bırakıldı"; }
        else if (request.Word.Length == 5) { symbolToLeave = '✹'; specialPower = "Alan Simgesi Bırakıldı"; }
        else if (request.Word.Length == 6) { symbolToLeave = '⇅'; specialPower = "Sütun Simgesi Bırakıldı"; }
        else if (request.Word.Length >= 7) { symbolToLeave = '✪'; specialPower = "Mega Simge Bırakıldı"; }

        // Eğer özel güç kazanıldıysa, kelimenin SON harfinin olduğu yeri patlatılacaklar listesinden çıkar ki aşağı düşsün!
        if (symbolToLeave != '\0' && request.Coordinates.Count > 0)
        {
            var lastCoord = request.Coordinates.Last();
            currentGrid[lastCoord.Row, lastCoord.Col] = symbolToLeave; // Simgeyi yerleştir
            request.Coordinates.RemoveAt(request.Coordinates.Count - 1); // Yerçekimi patlatmasın diye listeden çıkar
        }

        // Yerçekimini uygula
        char[,] updatedGrid = _gravityService.ApplyGravity(currentGrid, request.Coordinates);

        // Deadlock Kontrolü
        int validWordCount = _gridScanner.CalculatePlayableWordCount(updatedGrid);
        bool isReshuffled = false;
        
        if (validWordCount == 0)
        {
            // Önce karıştır
            var flatGrid = updatedGrid.Cast<char>().OrderBy(x => Guid.NewGuid()).ToList();
            int idx = 0;
            for (int r = 0; r < size; r++)
                for (int c = 0; c < size; c++)
                    updatedGrid[r, c] = flatGrid[idx++];
            
            validWordCount = _gridScanner.CalculatePlayableWordCount(updatedGrid);
            isReshuffled = true;

            // Eğer karıştırınca da çıkmadıysa garantili yeni üret
            if (validWordCount == 0)
            {
                updatedGrid = _gridGeneratorService.GenerateGrid(size);
                validWordCount = _gridScanner.CalculatePlayableWordCount(updatedGrid);
            }
        }

        _cache.Set(request.GameId, updatedGrid, TimeSpan.FromHours(1));

        return Ok(new
        {
            success = true,
            gainedScore = gainedScore,
            comboStr = comboStr,
            specialPowerGained = specialPower,
            validWordCount = validWordCount,
            isReshuffled = isReshuffled,
            newGrid = updatedGrid.Cast<char>().ToArray()
        });
    }

    [HttpPost("end-game")]
    public IActionResult EndGame([FromBody] SaveScoreDto request)
    {
        // Frontend artık AsyncStorage kullanıyor.
        // Geriye sadece 200 OK mock cevabı dönüyoruz.
        return Ok(new { success = true, message = "Oyun skoru yerel olarak kaydedildi!" });
    }
}
}