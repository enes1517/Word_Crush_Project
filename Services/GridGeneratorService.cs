using System;
using System.Collections.Generic;
using System.Text;

namespace Services
{
    public class GridGeneratorService
    {
        private readonly List<char> _letterPool = new ();
        private readonly Random random = new ();
        private readonly DictionaryService _dictionaryService;
        private readonly GridScannerService _gridScanner;

        public GridGeneratorService(DictionaryService dictionaryService, GridScannerService gridScanner)
        {
            _dictionaryService = dictionaryService;
            _gridScanner = gridScanner;
            InitializePool();
        }

        private void InitializePool()
        {
            char[] highFreq = { 'A', 'E', 'İ', 'L', 'R', 'N' };
            foreach (var c in highFreq) AddToPool(c, 10);

            char[] medFreq = { 'K', 'M', 'T', 'S', 'Y', 'D' };
            foreach (var c in medFreq) AddToPool(c, 5);

            char[] lowFreq = { 'J', 'Ğ', 'F', 'V' };
            foreach (var c in lowFreq) AddToPool(c, 1);
        }

        private void AddToPool(char letter, int count)
        {
            for (int i = 0; i < count; i++)
            {
                _letterPool.Add(letter);
            }
        }
        
        public char GetRandomFrequencyLetter()
        {
               var index= random.Next(0, _letterPool.Count);
               return _letterPool[index];
        }

        public char[,] GenerateGrid(int size)
        {
            char[,] grid = new char[size, size];

            // Maksimum 5 defa rastgele deneme yap
            for (int attempt = 0; attempt < 5; attempt++)
            {
                for(int i = 0; i < size; i++)
                {
                    for (int j = 0; j < size; j++)
                    {
                        grid[i,j] = GetRandomFrequencyLetter();
                    }
                }

                if (_gridScanner.CalculatePlayableWordCount(grid) >= 1)
                {
                    return grid; // En az 1 kelime varsa grid hazırdır
                }
            }

            // Eğer 5 denemede de kelime çıkmadıysa, "Kurallı Harf Üretimi" uygula
            // Rastgele 4 harfli geçerli bir kelimeyi ızgaraya yerleştir
            var randomWord = _dictionaryService.GetRandomWord(4); 
            if (string.IsNullOrEmpty(randomWord)) randomWord = "OYUN"; // Fallback

            int startR = random.Next(0, size);
            int startC = random.Next(0, size - randomWord.Length);

            for (int i = 0; i < randomWord.Length; i++)
            {
                grid[startR, startC + i] = randomWord[i];
            }

            return grid;
        }
    }
}
