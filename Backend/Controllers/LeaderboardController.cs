using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MyApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        [HttpGet("user/{userId}")]
        public IActionResult GetUserHistory(int userId)
        {
            // Veritabanı kaldırıldığı için lokal hafıza kullanılıyor. 
            // Sadece yedek API uyumluluğu için mock cevap dönülür.
            return Ok(new
            {
                stats = new
                {
                    totalGames = 0,
                    highScore = 0,
                    avgScore = 0,
                    totalWordCount = 0,
                    longestWordEver = "-",
                    totalPlayTimeInMinutes = 0
                },
                history = new List<object>()
            });
        }
    }
}
