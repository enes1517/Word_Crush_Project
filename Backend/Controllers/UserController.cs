using Entities.Dtos;
using Entities.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Repositories;

namespace MyApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody]RegisterDto register)
        {
            if (string.IsNullOrWhiteSpace(register.Username))
                return BadRequest("Kullanıcı adı boş olamaz.");

            // Veritabanı kaldırıldığı için lokal hafıza kullanılıyor. 
            // Sadece yedek API uyumluluğu için mock cevap dönülür.
            return Ok(new 
            {
                userId = new Random().Next(1000, 9999),
                username = register.Username,
                totalGold = 10000
            });
        }
    }
}
