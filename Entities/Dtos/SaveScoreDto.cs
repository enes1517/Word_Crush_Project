using System;
using System.Collections.Generic;
using System.Text;

namespace Entities.Dtos
{
    public class SaveScoreDto
    {
        public int UserId { get; set; }
        public int GridSize { get; set; }
        public int Score { get; set; }
        public int WordCount { get; set; }
        public string LongestWord { get; set; } = string.Empty;
        public int PlayTimeInMinutes { get; set; }
    }
}
