using System;
using System.Collections.Generic;
using System.Text;

namespace Entities.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TotalGold { get; set; } = 1000; // Başlangıçta 1000 altın verelim (Jokerler için)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Bire-Çok İlişki: Bir kullanıcının birden fazla skoru olabilir
        public List<GameScore> Scores { get; set; } = new();
    }
}
