using System;
using System.Collections.Generic;
using System.Text;

namespace Entities.Dtos
{
    public class MoveRequestDto
    {
        public string Word { get; set; } = string.Empty;
        public string GameId { get; set; } = string.Empty;
        public List<CoordinateDto> Coordinates { get; set; } = new();
    }
}
