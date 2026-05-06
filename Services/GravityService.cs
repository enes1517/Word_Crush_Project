using Entities.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace Services
{
    public class GravityService
    {
        private readonly GridGeneratorService _gridGenerator;

        public GravityService(GridGeneratorService gridGenerator)
        {
            _gridGenerator = gridGenerator;
        }

        public char[,] ApplyGravity(char[,] currentGrid, List<CoordinateDto> matchedCoordinates)
        {
            int size = currentGrid.GetLength(0);

            // 1. Eşleşen harfleri patlat (Boşluk karakteri '*' yapalım)
            foreach (var coord in matchedCoordinates)
            {
                currentGrid[coord.Row, coord.Col] = '*';
            }

            // 2. Harfleri Aşağı Kaydır (Sütun sütun gezeceğiz)
            for (int col = 0; col < size; col++)
            {
                // En alttan başlayarak yukarı doğru boşlukları doldur
                int emptyRow = size - 1;

                for (int row = size - 1; row >= 0; row--)
                {
                    if (currentGrid[row, col] != '*')
                    {
                        // Harfi boş olan en alt satıra taşı
                        char temp = currentGrid[row, col];
                        currentGrid[row, col] = '*';
                        currentGrid[emptyRow, col] = temp;
                        emptyRow--;
                    }
                }
            }
            // 3. Üstte kalan '*' boşluklarına yeni rastgele harf üret
            for (int col = 0; col < size; col++)
            {
                for (int row = 0; row < size; row++)
                {
                    if (currentGrid[row, col] == '*')
                    {
                        currentGrid[row, col] = _gridGenerator.GetRandomFrequencyLetter();
                    }
                }
            }

            return currentGrid; // Yerçekimi uygulanmış yeni grid
        }
    }
}
