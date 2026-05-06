import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://172.25.219.124:5000/api/'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  console.log(`📡 API İsteği: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Hatası:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- LOKAL VERİTABANI İŞLEMLERİ (ASYNCSTORAGE) ---

export const loginUser = async (username) => {
    let users = await AsyncStorage.getItem('users');
    users = users ? JSON.parse(users) : {};
    
    if (!users[username]) {
        users[username] = {
            userId: Math.floor(Math.random() * 1000000),
            username: username,
            totalGold: 10000,
            bestScore: 0,
            gamesPlayed: 0
        };
        await AsyncStorage.setItem('users', JSON.stringify(users));
    }
    
    await AsyncStorage.setItem('currentUser', JSON.stringify(users[username]));
    return { data: users[username] };
};

export const getLeaderboard = async (userId) => {
    let scores = await AsyncStorage.getItem('scores');
    scores = scores ? JSON.parse(scores) : [];
    
    // Filtrele: Sadece giriş yapan kullanıcının skorları
    const userScores = scores.filter(s => s.userId === userId);
    const sorted = userScores.sort((a,b) => b.score - a.score);

    let totalGames = sorted.length;
    let highScore = totalGames > 0 ? sorted[0].score : 0;
    let totalScore = sorted.reduce((sum, s) => sum + s.score, 0);
    let avgScore = totalGames > 0 ? Math.floor(totalScore / totalGames) : 0;
    let totalWordCount = sorted.reduce((sum, s) => sum + s.wordCount, 0);
    let totalPlayTime = sorted.reduce((sum, s) => sum + s.playTimeInMinutes, 0);
    
    let longestWordEver = '-';
    sorted.forEach(s => {
        if(s.longestWord && s.longestWord.length > longestWordEver.length && s.longestWord !== '-') {
            longestWordEver = s.longestWord;
        }
    });

    const stats = {
        totalGames: totalGames,
        highScore: highScore,
        avgScore: avgScore,
        totalWordCount: totalWordCount,
        longestWordEver: longestWordEver,
        totalPlayTimeInMinutes: totalPlayTime
    };

    // History listesini UI formatına uydur
    const history = sorted.map((s, index) => ({
        id: s.id || Math.random().toString(),
        orderNumber: totalGames - index,
        score: s.score,
        date: new Date(s.playedAt).toLocaleDateString('tr-TR'),
        gridSize: s.gridSize,
        wordCount: s.wordCount,
        longestWord: s.longestWord,
        playTimeInMinutes: s.playTimeInMinutes
    }));

    return { data: { stats: stats, history: history } };
};

export const endGame = async (data) => {
    let scores = await AsyncStorage.getItem('scores');
    scores = scores ? JSON.parse(scores) : [];
    
    let users = await AsyncStorage.getItem('users');
    users = users ? JSON.parse(users) : {};
    
    let uName = "Player";
    for(let k in users) {
        if(users[k].userId === data.userId) {
            uName = users[k].username;
            if (data.score > users[k].bestScore) users[k].bestScore = data.score;
            users[k].gamesPlayed += 1;
            break;
        }
    }
    await AsyncStorage.setItem('users', JSON.stringify(users));

    scores.push({
        id: Math.random().toString(),
        userId: data.userId,
        username: uName, 
        score: data.score,
        wordCount: data.wordCount,
        longestWord: data.longestWord,
        gridSize: data.gridSize,
        playedAt: new Date().toISOString()
    });
    
    await AsyncStorage.setItem('scores', JSON.stringify(scores));
    return { data: { success: true } };
};

// Algoritma için Backend'e, Altın için Lokale gider
export const useJoker = async (userId, gameId, jokerType, target, target2 = null) => {
    let cost = 0;
    if (jokerType === "Lolipop") cost = 75;
    if (jokerType === "Balık") cost = 100;
    if (jokerType === "Serbest Değiştirme") cost = 125;
    if (jokerType === "Tekerlek") cost = 200;
    if (jokerType === "Karıştırma") cost = 300;
    if (jokerType === "Parti Güçlendiricisi") cost = 400;

    let users = await AsyncStorage.getItem('users');
    users = users ? JSON.parse(users) : {};
    
    let uName = null;
    for(let k in users) {
        if(users[k].userId === userId) { uName = k; break; }
    }

    if (!uName || users[uName].totalGold < cost) {
        return { data: { success: false, message: "Yeterli altınınız yok!" } };
    }

    // Backend algoritmasını çağır
    const backendRes = await api.post('Game/use-joker', { userId, gameId, jokerType, target, target2 });
    
    if (backendRes.data.success) {
        users[uName].totalGold -= cost;
        await AsyncStorage.setItem('users', JSON.stringify(users));
        await AsyncStorage.setItem('currentUser', JSON.stringify(users[uName]));
        backendRes.data.remainingGold = users[uName].totalGold;
    }
    
    return backendRes;
};

// Pür Backend İşlemleri (Sadece algoritma)
export const startGame = (size) => api.get(`Game/Generate-Grid/${size}`);
export const makeMove = (gameId, word, coordinates) => api.post('Game/make-move', { gameId, word, coordinates });

export default api;
