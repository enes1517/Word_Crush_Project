using System;
using System.Collections.Generic;
using System.Text;
using System.Globalization;

namespace Services
{
    public class ScoreCalculator
    {
        private readonly DictionaryService _dictionaryService;

        private readonly Dictionary<char, int> _letterScores = new()
        {
            {'A',1}, {'B',3}, {'C',4}, {'Ç',4}, {'D',3}, {'E',1}, {'F',7}, {'G',5}, {'Ğ',8},
            {'H',5}, {'I',2}, {'İ',1}, {'J',10},{'K',1}, {'L',1}, {'M',2}, {'N',1}, {'O',2},
            {'Ö',7}, {'P',5}, {'R',1}, {'S',2}, {'Ş',4}, {'T',1}, {'U',2}, {'Ü',3}, {'V',7},
            {'Y',3}, {'Z',4}
        };

        public ScoreCalculator(DictionaryService service)
        {
            _dictionaryService = service;
        }

        public int CalculateScoreLetter(string word)
        {
            int score = 0;
            foreach (char ch in word.Trim().ToUpper( new CultureInfo("tr-TR")))
            {
                if (_letterScores.ContainsKey(ch))
                    score += _letterScores[ch];

                
            }
            return score;
        }
        public (int TotalScore,int ComboCount) CalculateComvoAndScore(string word)
        {
            int TotalScore = 0;
            int ComboCount = 0;

            List<string> foundSubWords= new List<string>();

            for (int lenght = 3; lenght <= word.Length; lenght++)
            {
                for (int i = 0; i <= word.Length - lenght; i++)
                {
                    var subWord = word.Substring(i, lenght);

                    if (_dictionaryService.IsWordValid(subWord) && !(foundSubWords.Contains(subWord)) )
                    {
                        foundSubWords.Add(subWord);
                        TotalScore += CalculateScoreLetter(subWord);
                        ComboCount++;
                    }

                }

            }
            return (TotalScore, ComboCount);


        }
    }
}
