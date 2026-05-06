/**
 * GameScreen.js — Word Crush Premium Sürüm
 * 
 * Özellikler:
 * - LayoutAnimation ile pürüzsüz harf düşme efektleri
 * - Animated API ile canlı istatistikler ve seçim animasyonları
 * - Gelişmiş cam (glassmorphism) tasarımı
 * - Özel güçler için parlama (pulse) efekti
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Dimensions, Alert,
    TouchableOpacity, ActivityIndicator, PanResponder, ScrollView,
    Animated, LayoutAnimation, Platform, UIManager, BackHandler, Easing
} from 'react-native';

// ── TOAST BİLDİRİM BİLEŞENİ ────────────────────────────────────
const Toast = ({ message, type, onHide }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity,     { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(translateY,  { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity,    { toValue: 0, duration: 350, useNativeDriver: true }),
                    Animated.timing(translateY, { toValue: -20, duration: 350, useNativeDriver: true }),
                ]).start(() => onHide && onHide());
            }, 1600);
        });
    }, []);

    const bgColor = type === 'error'   ? 'rgba(231,76,60,0.92)'
                  : type === 'warning' ? 'rgba(243,156,18,0.92)'
                  : type === 'info'    ? 'rgba(52,152,219,0.92)'
                  :                     'rgba(39,174,96,0.92)';

    const icon = type === 'error'   ? '✗'
               : type === 'warning' ? '⚠'
               : type === 'info'    ? 'ℹ'
               :                     '✓';

    return (
        <Animated.View style={[
            toastStyles.toast,
            { backgroundColor: bgColor, opacity, transform: [{ translateY }] }
        ]}>
            <Text style={toastStyles.icon}>{icon}</Text>
            <Text style={toastStyles.msg}>{message}</Text>
        </Animated.View>
    );
};

const toastStyles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 12,
        maxWidth: '85%',
    },
    icon: { color: '#fff', fontSize: 18, marginRight: 8, fontWeight: '900' },
    msg:  { color: '#fff', fontSize: 15, fontWeight: '700', flexShrink: 1 },
});
import { LinearGradient } from 'expo-linear-gradient';
import { startGame, makeMove, useJoker, endGame } from '../api/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BOARD_MARGIN = 12;
const BOARD_SIZE   = SCREEN_W - BOARD_MARGIN * 2;

// Android'de LayoutAnimation için gerekli
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Harika Patlama Efekti (Particle System + Floating Text)
const ParticleExplosion = ({ x, y, scoreText, onComplete }) => {
    const particles = useRef([...Array(25)].map(() => new Animated.Value(0))).current;
    const textAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            ...particles.map((anim) => 
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 800 + Math.random() * 400,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true
                })
            ),
            scoreText ? Animated.timing(textAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true
            }) : Animated.timing(new Animated.Value(0), { toValue: 1, duration: 0, useNativeDriver: true })
        ]).start(() => onComplete && onComplete());
    }, []);

    return (
        <View style={{ position: 'absolute', left: x, top: y, zIndex: 999 }} pointerEvents="none">
            {particles.map((anim, i) => {
                const angle = (i * 14.4 * Math.PI) / 180;
                const distance = 80 + Math.random() * 100;
                
                const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
                const translateY = anim.interpolate({ 
                    inputRange: [0, 0.4, 1], 
                    outputRange: [0, Math.sin(angle) * distance - 30, Math.sin(angle) * distance + 60] 
                });
                
                const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
                const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.8, 0] });
                const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + Math.random() * 720}deg`] });
                
                const colors = ['#FFD700', '#FF5733', '#00E5FF', '#FF00FF', '#00FF00', '#FFFFFF'];

                return (
                    <Animated.View key={i} style={{
                        position: 'absolute',
                        width: i % 3 === 0 ? 10 : 16, height: i % 3 === 0 ? 10 : 16,
                        borderRadius: i % 3 === 0 ? 0 : 8,
                        backgroundColor: colors[i % colors.length],
                        transform: [{ translateX }, { translateY }, { scale }, { rotate }],
                        opacity,
                        shadowColor: colors[i % colors.length],
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 1,
                        shadowRadius: 15,
                        elevation: 10
                    }} />
                );
            })}

            {scoreText && (
                <Animated.View style={{
                    position: 'absolute',
                    transform: [
                        { translateX: -30 },
                        { translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) },
                        { scale: textAnim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0.5, 1.8, 1.2, 1] }) }
                    ],
                    opacity: textAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
                }}>
                    <Text style={{
                        color: '#FFD700',
                        fontSize: 32,
                        fontWeight: '900',
                        textShadowColor: 'rgba(0,0,0,0.8)',
                        textShadowOffset: { width: 2, height: 2 },
                        textShadowRadius: 5
                    }}>{scoreText}</Text>
                </Animated.View>
            )}
        </View>
    );
};

export default function GameScreen({ route, navigation }) {
    const { size, user, totalMoves } = route.params;
    const CELL_SIZE = BOARD_SIZE / size;

    /* ─── STATE ─────────────────────────────────────────────── */
    const [gameId,         setGameId]        = useState(null);
    const [grid,           setGrid]          = useState([]);
    const [loading,        setLoading]       = useState(true);
    const [score,          setScore]         = useState(0);
    const [wordCount,      setWordCount]     = useState(0);
    const [longestWord,    setLongestWord]   = useState('');
    const [startTime]                        = useState(Date.now());
    const [gold,           setGold]          = useState(user.totalGold);
    const [movesLeft,      setMovesLeft]     = useState(totalMoves || 20);
    const [selectedCoords, setSelectedCoords] = useState([]);
    const [selectedWord,   setSelectedWord]   = useState('');
    const [activeJoker,    setActiveJoker]    = useState(null);
    const [swapFirst,      setSwapFirst]      = useState(null);
    const [validWordCount, setValidWordCount] = useState(0);
    const [explosions,     setExplosions]     = useState([]);
    const [toasts,         setToasts]         = useState([]);

    const showToast = (message, type = 'error') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    /* ─── ANIMASYONLAR ──────────────────────────────────────── */
    const scoreAnim = useRef(new Animated.Value(1)).current;
    const goldAnim  = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const animateStat = (val) => {
        Animated.sequence([
            Animated.timing(val, { toValue: 1.3, duration: 100, useNativeDriver: true }),
            Animated.spring(val, { toValue: 1, friction: 4, useNativeDriver: true })
        ]).start();
    };

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    /* ─── REF'LER ───────────────────────────────────────────── */
    const boardRef       = useRef(null);

    const selRef         = useRef([]);
    const gridRef        = useRef([]);
    const gameIdRef      = useRef(null);
    const activeJokerRef = useRef(null);
    const swapFirstRef   = useRef(null);
    const movesLeftRef   = useRef(totalMoves || 20);
    const scoreRef       = useRef(0);
    const wordCountRef   = useRef(0);
    const longestWordRef = useRef('');

    useEffect(() => { selRef.current         = selectedCoords; }, [selectedCoords]);
    useEffect(() => { gridRef.current        = grid;           }, [grid]);
    useEffect(() => { gameIdRef.current      = gameId;         }, [gameId]);
    useEffect(() => { activeJokerRef.current = activeJoker;    }, [activeJoker]);
    useEffect(() => { swapFirstRef.current   = swapFirst;      }, [swapFirst]);
    useEffect(() => { movesLeftRef.current   = movesLeft;      }, [movesLeft]);
    useEffect(() => { scoreRef.current       = score;          }, [score]);
    useEffect(() => { wordCountRef.current   = wordCount;      }, [wordCount]);
    useEffect(() => { longestWordRef.current = longestWord;    }, [longestWord]);

    useEffect(() => {
        initGame();
    }, []);

    useEffect(() => {
        if (movesLeft === 0) {
            Alert.alert('Hamleler Bitti!', 'Oyun sona erdi, skorunuz kaydedildi.', [
                { text: 'Tamam', onPress: () => finishGameRef.current() },
            ]);
        }
    }, [movesLeft]);

    useEffect(() => {
        const backAction = () => {
            Alert.alert('Çıkış', 'Oyundan çıkmak istediğinize emin misiniz?', [
                { text: 'Hayır', onPress: () => null, style: 'cancel' },
                { text: 'Evet', onPress: () => finishGameRef.current() },
            ]);
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity onPress={backAction} style={{ paddingHorizontal: 10 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Geri</Text>
                </TouchableOpacity>
            )
        });

        return () => backHandler.remove();
    }, [navigation]);

    const initGame = async () => {
        try {
            const res = await startGame(size);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            setGameId(res.data.gameId);
            setGrid(res.data.grid);
            setValidWordCount(res.data.validWordCount || 0);
        } catch {
            Alert.alert('Hata', 'Oyun başlatılamadı!');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    // measureBoard ve boardOrigin yerine, dokunulan hedefin lokal koordinatlarını kullanıyoruz.
    const touchStartLocal = useRef({ x: 0, y: 0 });

    const getCellAtLocal = (localX, localY) => {
        if (localX < 0 || localY < 0 || localX > BOARD_SIZE || localY > BOARD_SIZE) return null;
        const col = Math.floor(localX / CELL_SIZE);
        const row = Math.floor(localY / CELL_SIZE);
        if (row < 0 || row >= size || col < 0 || col >= size) return null;
        return { row, col };
    };

    const addCell = (row, col) => {
        const prev = selRef.current;

        // ── GERİ GİTME (BACKTRACK) ──────────────────────────────
        // Kullanıcı zaten seçili bir hücreye giderse, o hücreden
        // sonrasını listeden çıkararak geri gider (a-b-a → a-b)
        const existingIdx = prev.findIndex(c => c.Row === row && c.Col === col);
        if (existingIdx !== -1) {
            const next = prev.slice(0, existingIdx + 1);
            const word = next.map(c => gridRef.current[c.Row * size + c.Col] || '').join('');
            selRef.current = next;
            setSelectedCoords(next);
            setSelectedWord(word);
            return;
        }

        if (!activeJokerRef.current && prev.length > 0) {
            const last = prev[prev.length - 1];
            if (Math.abs(last.Row - row) > 1 || Math.abs(last.Col - col) > 1) return;
        }
        if (activeJokerRef.current && prev.length >= 1) return;

        const next = [...prev, { Row: row, Col: col }];
        const word = next.map(c => gridRef.current[c.Row * size + c.Col] || '').join('');
        selRef.current = next;
        setSelectedCoords(next);
        setSelectedWord(word);
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder:        () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder:         () => true,
            onMoveShouldSetPanResponderCapture:  () => true,
            onPanResponderTerminationRequest:    () => false,

            onPanResponderGrant: (e, gs) => {
                selRef.current = [];
                setSelectedCoords([]);
                setSelectedWord('');
                
                touchStartLocal.current = {
                    x: e.nativeEvent.locationX,
                    y: e.nativeEvent.locationY
                };
                
                const cell = getCellAtLocal(touchStartLocal.current.x, touchStartLocal.current.y);
                if (cell) addCell(cell.row, cell.col);
            },

            onPanResponderMove: (e, gs) => {
                const currentLocalX = touchStartLocal.current.x + gs.dx;
                const currentLocalY = touchStartLocal.current.y + gs.dy;
                const cell = getCellAtLocal(currentLocalX, currentLocalY);
                if (cell) addCell(cell.row, cell.col);
            },

            onPanResponderRelease: () => {
                handleReleaseRef.current();
            },

            onPanResponderTerminate: () => {
                selRef.current = [];
                setSelectedCoords([]);
                setSelectedWord('');
            },
        })
    ).current;

    const handleReleaseRef = useRef(null);
    handleReleaseRef.current = async () => {
        const coords = selRef.current;
        const word   = coords.map(c => gridRef.current[c.Row * size + c.Col] || '').join('');

        if (coords.length === 0) return;

        const joker = activeJokerRef.current;
        if (joker) {
            if (joker === 'Serbest Değiştirme') {
                if (!swapFirstRef.current) {
                    setSwapFirst({ Row: coords[0].Row, Col: coords[0].Col });
                    Alert.alert('1. Harf Seçildi', 'Şimdi İKİNCİ harfe dokunun.');
                } else {
                    await applyJokerRef.current(joker, swapFirstRef.current,
                        { Row: coords[0].Row, Col: coords[0].Col });
                    setActiveJoker(null); activeJokerRef.current = null;
                    setSwapFirst(null);
                }
            } else {
                await applyJokerRef.current(joker, { Row: coords[0].Row, Col: coords[0].Col });
                setActiveJoker(null); activeJokerRef.current = null;
            }
        } else if (coords.length === 1 && ['⇆','⇅','✹','✪'].includes(word)) {
            await sendMoveRef.current(word, coords);
        } else if (coords.length >= 3) {
            await sendMoveRef.current(word, coords);
        }

        selRef.current = [];
        setSelectedCoords([]);
        setSelectedWord('');
    };

    const sendMoveRef = useRef(null);
    sendMoveRef.current = async (word, coords) => {
        try {
            const res = await makeMove(gameIdRef.current, word, coords);
            
            const newMoves = movesLeftRef.current - 1;
            setMovesLeft(newMoves);
            
            if (res.data.success) {
                // Patlama Efekti Tetikleyici
                if (coords && coords.length > 0) {
                    const avgC = coords.reduce((sum, c) => sum + c.Col, 0) / coords.length;
                    const avgR = coords.reduce((sum, c) => sum + c.Row, 0) / coords.length;
                    const centerX = (avgC * CELL_SIZE) + (CELL_SIZE / 2);
                    const centerY = (avgR * CELL_SIZE) + (CELL_SIZE / 2);
                    
                    const scoreText = res.data.gainedScore ? `+${res.data.gainedScore}` : '';
                    setExplosions(prev => [...prev, { id: Date.now() + Math.random(), x: centerX, y: centerY, text: scoreText }]);
                }

                // Harf düşme efekti için LayoutAnimation
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                
                setGrid(res.data.newGrid);
                const ns = scoreRef.current + res.data.gainedScore;
                setScore(ns); 
                animateStat(scoreAnim);
                
                const nw = wordCountRef.current + 1;
                setWordCount(nw);
                
                if (word.length > longestWordRef.current.length) {
                    setLongestWord(word);
                }
                
                if (res.data.validWordCount !== undefined) {
                    setValidWordCount(res.data.validWordCount);
                }
                
                if (res.data.isReshuffled)
                    showToast('Kelime kalmadı! Tahta yenilendi 🔀', 'info');
            } else {
                showToast(res.data.message || 'Kelime sözlükte yok ✗', 'error');
            }
        } catch (e) {
            Alert.alert('Bağlantı Hatası', 'Sunucuya ulaşılamadı.');
        }
    };

    const applyJokerRef = useRef(null);
    applyJokerRef.current = async (jokerType, target, target2 = null) => {
        try {
            const res = await useJoker(user.userId, gameIdRef.current, jokerType, target, target2);
            if (res.data.success) {
                // Joker Patlama Efekti
                if (target) {
                    const centerX = (target.Col * CELL_SIZE) + (CELL_SIZE / 2);
                    const centerY = (target.Row * CELL_SIZE) + (CELL_SIZE / 2);
                    setExplosions(prev => [...prev, { id: Date.now() + Math.random(), x: centerX, y: centerY, text: '💥' }]);
                } else {
                    // Tüm ekranda patlama (Karıştırma vs.)
                    setExplosions(prev => [...prev, { id: Date.now() + Math.random(), x: BOARD_SIZE / 2, y: BOARD_SIZE / 2, text: '✨' }]);
                }

                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                setGrid(res.data.newGrid);
                setGold(res.data.remainingGold);
                if (res.data.validWordCount !== undefined) {
                    setValidWordCount(res.data.validWordCount);
                }
                if (res.data.isReshuffled) {
                    showToast('Tahta yenilendi! 🔀', 'info');
                }
                animateStat(goldAnim);
            } else {
                Alert.alert('Hata', res.data.message);
            }
        } catch {
            Alert.alert('Hata', 'Joker uygulanamadı.');
        }
    };

    const handleJokerClick = (jokerType) => {
        if (['Balık', 'Karıştırma', 'Parti Güçlendiricisi'].includes(jokerType)) {
            applyJokerRef.current(jokerType, null);
        } else if (jokerType === 'Serbest Değiştirme') {
            setActiveJoker(jokerType);
            setSwapFirst(null);
            Alert.alert('Serbest Değiştirme', 'BİRİNCİ harfe dokunun.');
        } else {
            setActiveJoker(jokerType);
            Alert.alert('Joker Aktif', `${jokerType} — Hedef seçin.`);
        }
    };

    const finishGameRef = useRef(null);
    finishGameRef.current = async () => {
        const playTime = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
        try {
            await endGame({
                userId: user.userId, gridSize: size,
                score: scoreRef.current, wordCount: wordCountRef.current,
                longestWord: longestWordRef.current || '-',
                playTimeInMinutes: playTime,
            });
            Alert.alert('Oyun Bitti!', `Skorun tabloyaz yazıldı: ${scoreRef.current}`, [
                { text: 'Tamam', onPress: () => navigation.replace('Home', { user }) },
            ]);
        } catch {
            Alert.alert('Hata', 'Skor kaydedilemedi!');
            navigation.goBack();
        }
    };

    const isSelected = (r, c) => selectedCoords.some(s => s.Row === r && s.Col === c);
    const fontSize = size <= 6 ? 24 : size <= 8 ? 18 : 14;

    if (loading) {
        return (
            <LinearGradient colors={['#0f2027', '#203a43']} style={styles.loading}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>SİSTEM HAZIRLANIYOR...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>

            {/* ── TOAST BİLDİRİMLERİ ── */}
            {toasts.map(t => (
                <Toast
                    key={t.id}
                    message={t.message}
                    type={t.type}
                    onHide={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                />
            ))}
            
            {/* Üst Panel (Glassmorphism) */}
            <View style={styles.topPanel}>
                <Animated.View style={[styles.statBox, { transform: [{ scale: scoreAnim }] }]}>
                    <Text style={styles.statLabel}>SKOR</Text>
                    <Text style={styles.statValue}>{score}</Text>
                </Animated.View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>HAMLE</Text>
                    <Text style={[styles.statValue, movesLeft <= 5 && { color: '#ff4b2b' }]}>{movesLeft}</Text>
                </View>
                <Animated.View style={[styles.statBox, { transform: [{ scale: goldAnim }] }]}>
                    <Text style={styles.statLabel}>ALTIN</Text>
                    <Text style={[styles.statValue, { color: '#FFD700' }]}>{gold}</Text>
                </Animated.View>
            </View>

            {/* Kelime Bulunabilirlik Barı (Kural 2) */}
            <View style={styles.wordCountBadge}>
                <Text style={styles.wordCountText}>Gridde Oluşturulabilir Kelime Sayısı: <Text style={styles.wordCountValue}>{validWordCount}</Text></Text>
            </View>

            {/* Kelime Önizleme */}
            <View style={styles.previewContainer}>
                <LinearGradient colors={['rgba(255,255,255,0.1)', 'transparent']} style={styles.previewGradient}>
                    <Text style={styles.previewText}>{selectedWord || ' '}</Text>
                </LinearGradient>
            </View>

            {/* Oyun Tahtası */}
            <View 
                ref={boardRef}
                style={styles.board}
                {...panResponder.panHandlers}
            >
                {Array.from({ length: size }, (_, r) => (
                    <View key={r} style={styles.row} pointerEvents="none">
                        {Array.from({ length: size }, (_, c) => {
                            const char     = grid[r * size + c] || '';
                            const selected = isSelected(r, c);
                            const special  = ['⇆','⇅','✹','✪'].includes(char);
                            
                            return (
                                <View
                                    key={c}
                                    style={[
                                        styles.cell,
                                        selected && styles.cellSelected,
                                        special && !selected && styles.cellSpecial,
                                    ]}
                                >
                                    {special && !selected ? (
                                        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={[styles.cellText, { fontSize, color: '#e67e22' }]}>{char}</Text>
                                        </Animated.View>
                                    ) : (
                                        <Animated.View style={{
                                            transform: [{ scale: selected ? 1.2 : 1 }],
                                            width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'
                                        }}>
                                            <Text style={[
                                                styles.cellText, 
                                                { fontSize },
                                                selected && { color: '#fff', textShadowColor: '#FFD700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }
                                            ]}>
                                                {char}
                                            </Text>
                                        </Animated.View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
                
                {/* Patlama Efektlerini Çiz */}
                {explosions.map(exp => (
                    <ParticleExplosion key={exp.id} x={exp.x} y={exp.y} scoreText={exp.text} onComplete={() => {
                        setExplosions(prev => prev.filter(p => p.id !== exp.id));
                    }} />
                ))}
            </View>

            {/* Joker Bar (Yatay Kaydırmalı) */}
            <View style={styles.jokerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.jokerList}>
                    {[
                        { id: 'Lolipop', icon: '🍭', price: 75 },
                        { id: 'Balık', icon: '🐟', price: 100 },
                        { id: 'Serbest Değiştirme', icon: '🔄', price: 125 },
                        { id: 'Tekerlek', icon: '🎡', price: 200 },
                        { id: 'Karıştırma', icon: '🔀', price: 300 },
                        { id: 'Parti Güçlendiricisi', icon: '🎉', price: 400 },
                    ].map(j => (
                        <TouchableOpacity 
                            key={j.id} 
                            style={[styles.jokerCard, activeJoker === j.id && styles.jokerActive]}
                            onPress={() => handleJokerClick(j.id)}
                        >
                            <Text style={styles.jokerIcon}>{j.icon}</Text>
                            <Text style={styles.jokerPrice}>{j.price}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Alt Buton */}
            <TouchableOpacity style={styles.endButton} onPress={() => finishGameRef.current()}>
                <LinearGradient colors={['#e74c3c', '#c0392b']} style={styles.endButtonGradient}>
                    <Text style={styles.endButtonText}>OYUNU BİTİR VE KAYDET</Text>
                </LinearGradient>
            </TouchableOpacity>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingVertical: 10 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#FFD700', marginTop: 15, fontWeight: 'bold', letterSpacing: 2 },
    
    topPanel: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '94%', 
        marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    statBox: { alignItems: 'center', minWidth: 80 },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold' },
    statValue: { color: '#fff', fontSize: 22, fontWeight: '900' },

    wordCountBadge: {
        backgroundColor: 'rgba(67, 198, 172, 0.2)',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(67, 198, 172, 0.5)'
    },
    wordCountText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    wordCountValue: { color: '#FFD700', fontWeight: '900', fontSize: 15 },

    previewContainer: { height: 60, width: '100%', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    previewGradient: { paddingHorizontal: 30, paddingVertical: 8, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    previewText: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 6, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },

    board: { 
        width: BOARD_SIZE, 
        height: BOARD_SIZE, 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 15, 
        padding: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    row: { flex: 1, flexDirection: 'row' },
    cell: { 
        flex: 1, 
        margin: 2, 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        borderRadius: 10, 
        justifyContent: 'center', 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3
    },
    cellSelected: { backgroundColor: '#FF416C', transform: [{ scale: 0.96 }] },
    cellSpecial: { backgroundColor: '#FFD700', borderWidth: 2, borderColor: '#f39c12' },
    cellText: { fontWeight: 'bold', color: '#2c3e50' },

    jokerContainer: { width: '100%', marginTop: 20 },
    jokerList: { paddingHorizontal: 15, paddingBottom: 10 },
    jokerCard: { 
        width: 75, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        marginRight: 12, 
        padding: 10, 
        borderRadius: 18, 
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)'
    },
    jokerActive: { backgroundColor: 'rgba(255,215,0,0.3)', borderColor: '#FFD700', borderWidth: 2 },
    jokerIcon: { fontSize: 26 },
    jokerPrice: { color: '#FFD700', fontWeight: 'bold', fontSize: 12, marginTop: 4 },

    endButton: { width: '90%', marginTop: 'auto', marginBottom: 15, borderRadius: 15, overflow: 'hidden' },
    endButtonGradient: { paddingVertical: 16, alignItems: 'center' },
    endButtonText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }
});
