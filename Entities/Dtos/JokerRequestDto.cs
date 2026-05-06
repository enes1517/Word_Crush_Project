using System;
using System.Collections.Generic;
using System.Text;

namespace Entities.Dtos
{
    public class JokerRequestDto
    {
        public int UserId { get; set; }
        public string GameId { get; set; } = string.Empty;
        public string JokerType { get; set; } = string.Empty; 
        public CoordinateDto? Target { get; set; } 
        public CoordinateDto? Target2 { get; set; }
    }
}
