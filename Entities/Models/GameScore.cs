using System;
using System.Collections.Generic;
using System.Text;

namespace Entities.Models
{
    public class GameScore
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Hangi kullanıcı oynadı
        public int GridSize { get; set; } // 6, 8 veya 10 (Zorluk)
        public int Score { get; set; } // Toplam Puan
        public int WordCount { get; set; } // Bulduğu kelime sayısı
        public string LongestWord { get; set; } = string.Empty;
        public int PlayTimeInMinutes { get; set; } // Oynama süresi
        public DateTime PlayedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public User? User { get; set; }
    }

}
