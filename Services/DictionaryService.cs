using System;
using System.Collections.Generic;
using System.IO; 
using System.Globalization;

namespace Services
{
    public class DictionaryService
    {
        private HashSet<string> _validWords;

        public DictionaryService()
        {
            _validWords = new HashSet<string>();
            LoadDictionary();
        }
        private void LoadDictionary()
        {
            string[] pathsToTry = {
                Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "sozluk.txt"),
                Path.Combine(Directory.GetCurrentDirectory(), "sozluk.txt"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "sozluk.txt"),
                "C:\\Users\\HP\\Desktop\\yazlab2\\sozluk.txt" // Fallback
            };

            string finalPath = "";
            foreach (var p in pathsToTry) {
                if (File.Exists(p)) { finalPath = p; break; }
            }

            if (string.IsNullOrEmpty(finalPath)) 
                throw new FileNotFoundException("sozluk.txt bulunamadı! Lütfen dosyanın yolunu kontrol edin.");

            var lines = File.ReadAllLines(finalPath);

            foreach (var line in lines)
            {
                if (line.Trim().Length >= 3)
                {
                    _validWords.Add(line.Trim().ToUpper(new CultureInfo("tr-TR")));
                }
            }
        }
        public bool IsWordValid(string word)
        {
            return _validWords.Contains(word.ToUpper(new CultureInfo("tr-TR")));
        }

        public string GetRandomWord(int length)
        {
            var matchingWords = new List<string>();
            foreach (var w in _validWords)
            {
                if (w.Length == length) matchingWords.Add(w);
            }
            if (matchingWords.Count == 0) return null;
            
            var rand = new Random();
            return matchingWords[rand.Next(matchingWords.Count)];
        }
    }
}