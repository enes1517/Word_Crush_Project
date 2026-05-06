using Microsoft.AspNetCore.Mvc;

namespace MyApp.API.Controllers;

// ÖRNEK CONTROLLER — Kendi controller'larını buraya ekle
[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
    // GET: api/hello
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "C# API çalışıyor!", zaman = DateTime.Now });
    }

    // POST: api/hello
    [HttpPost]
    public IActionResult Post([FromBody] object data)
    {
        return Ok(new { message = "Veri alındı", data });
    }
}
