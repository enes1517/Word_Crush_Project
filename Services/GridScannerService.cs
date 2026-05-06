using System;
using System.Collections.Generic;
using System.Text;

namespace Services
{
    public class GridScannerService
    {
        private readonly DictionaryService _dictionaryService;

        // 8 Yön (Sağ, Sol, Alt, Üst ve Çaprazlar)
        private readonly int[] rowDir = { -1, -1, -1, 0, 0, 1, 1, 1 };
        private readonly int[] colDir = { -1, 0, 1, -1, 1, -1, 0, 1 };

        public GridScannerService(DictionaryService dictionaryService)
        {
            _dictionaryService = dictionaryService;
        }

        // Ortak harf kullanmayan, oynanabilir geçerli kelime sayısını hesaplar.
        public int CalculatePlayableWordCount(char[,] grid)
        {
            int size = grid.GetLength(0);
            int wordCount = 0;
            bool[,] globalUsed = new bool[size, size];

            for (int r = 0; r < size; r++)
            {
                for (int c = 0; c < size; c++)
                {
                    if (!globalUsed[r, c])
                    {
                        bool[,] localVisited = new bool[size, size];
                        List<(int, int)> currentPath = new List<(int, int)>();
                        
                        if (DFS_FindNonOverlapping(grid, r, c, "", localVisited, globalUsed, currentPath, size))
                        {
                            wordCount++;
                        }
                    }
                }
            }

            return wordCount;
        }

        private bool DFS_FindNonOverlapping(char[,] grid, int r, int c, string currentWord, 
            bool[,] localVisited, bool[,] globalUsed, List<(int, int)> currentPath, int size)
        {
            // Hücre daha önce başka bir kelimede kullanıldıysa atla
            if (globalUsed[r, c]) return false;

            localVisited[r, c] = true;
            currentPath.Add((r, c));
            currentWord += grid[r, c];

            // Performans için derinliği sınırla (Maksimum 7 harfli kelime taraması)
            if (currentWord.Length > 7)
            {
                localVisited[r, c] = false;
                currentPath.RemoveAt(currentPath.Count - 1);
                return false;
            }

            // Kural: En az 3 harfli olmalı ve sözlükte olmalı
            if (currentWord.Length >= 3 && _dictionaryService.IsWordValid(currentWord))
            {
                // Geçerli bir kelime bulduk! Bu harfleri "kullanıldı" olarak işaretle
                foreach (var pos in currentPath)
                {
                    globalUsed[pos.Item1, pos.Item2] = true;
                }
                return true; 
            }

            // 8 Yönde komşulara git
            for (int i = 0; i < 8; i++)
            {
                int newR = r + rowDir[i];
                int newC = c + colDir[i];

                if (newR >= 0 && newR < size && newC >= 0 && newC < size && !localVisited[newR, newC])
                {
                    if (DFS_FindNonOverlapping(grid, newR, newC, currentWord, localVisited, globalUsed, currentPath, size))
                        return true;
                }
            }

            // Backtracking (Geri Dönüş)
            localVisited[r, c] = false;
            currentPath.RemoveAt(currentPath.Count - 1);
            return false;
        }
    }
}
