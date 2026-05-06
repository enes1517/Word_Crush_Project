/**
 * ScoreScreen.js — Word Crush Premium Skor Tablosu
 * 
 * Özellikler:
 * - Glowing Dashboard (Parlayan İstatistik Paneli)
 * - Gradient Kartlar ve Modern Badge'ler
 * - Akıcı liste tasarımı
 */

import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    ActivityIndicator, SafeAreaView, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getLeaderboard } from '../api/api';

export default function ScoreScreen({ route }) {
    const { user } = route.params;
    const [history, setHistory] = useState([]);
    const [stats,   setStats]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            const res = await getLeaderboard(user.userId);
            setStats(res.data.stats);
            setHistory(res.data.history);
        } catch (e) {
            console.log('ScoreScreen fetch error:', e);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (totalMinutes) => {
        if (!totalMinutes || totalMinutes === 0) return '0 dk';
        const hours = Math.floor(totalMinutes / 60);
        const mins  = totalMinutes % 60;
        if (hours === 0) return `${mins} dk`;
        return `${hours}s ${mins}d`;
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <LinearGradient colors={['rgba(255,255,255,0.08)', 'transparent']} style={styles.cardGrad}>
                <View style={styles.cardHeader}>
                    <View style={styles.gameBadge}>
                        <Text style={styles.gameBadgeText}>Oyun #{item.orderNumber}</Text>
                    </View>
                    <Text style={styles.scoreText}>{item.score} <Text style={{fontSize: 12, color: '#aaa'}}>PUAN</Text></Text>
                </View>

                <Text style={styles.dateText}>📅 {item.date}</Text>

                <View style={styles.divider} />

                <View style={styles.detailGrid}>
                    <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>IZGARA</Text>
                        <Text style={styles.detailValue}>{item.gridSize}x{item.gridSize}</Text>
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>KELİME</Text>
                        <Text style={styles.detailValue}>{item.wordCount}</Text>
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>EN UZUN</Text>
                        <Text style={styles.detailValue}>{item.longestWord || '-'}</Text>
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>SÜRE</Text>
                        <Text style={styles.detailValue}>{item.playTimeInMinutes} dk</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#0f0c29', '#302b63']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#43C6AC" />
                <Text style={styles.loadingText}>Veriler Alınıyor...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        stats ? (
                            <View>
                                <Text style={styles.headerTitle}>Kariyer İstatistikleri</Text>
                                
                                <View style={styles.statsPanel}>
                                    <View style={styles.statsRow}>
                                        <View style={styles.statsItem}>
                                            <Text style={styles.statsIcon}>🎯</Text>
                                            <Text style={styles.statsLabel}>Toplam Oyun</Text>
                                            <Text style={styles.statsValue}>{stats.totalGames}</Text>
                                        </View>
                                        <View style={[styles.statsItem, styles.statsItemMain]}>
                                            <Text style={styles.statsIcon}>🔥</Text>
                                            <Text style={styles.statsLabel}>En Yüksek</Text>
                                            <Text style={[styles.statsValue, { color: '#00d2ff', fontSize: 24 }]}>{stats.highScore}</Text>
                                        </View>
                                        <View style={styles.statsItem}>
                                            <Text style={styles.statsIcon}>📊</Text>
                                            <Text style={styles.statsLabel}>Ortalama</Text>
                                            <Text style={styles.statsValue}>{stats.avgScore}</Text>
                                        </View>
                                    </View>

                                    <View style={[styles.statsRow, { marginTop: 20 }]}>
                                        <View style={styles.statsItem}>
                                            <Text style={styles.statsIcon}>🔤</Text>
                                            <Text style={styles.statsLabel}>Kelimeler</Text>
                                            <Text style={styles.statsValue}>{stats.totalWordCount}</Text>
                                        </View>
                                        <View style={styles.statsItem}>
                                            <Text style={styles.statsIcon}>📏</Text>
                                            <Text style={styles.statsLabel}>En Uzun</Text>
                                            <Text style={styles.statsValue} numberOfLines={1}>{stats.longestWordEver || '-'}</Text>
                                        </View>
                                        <View style={styles.statsItem}>
                                            <Text style={styles.statsIcon}>⌛</Text>
                                            <Text style={styles.statsLabel}>Toplam Süre</Text>
                                            <Text style={styles.statsValue}>{formatTime(stats.totalPlayTimeInMinutes)}</Text>
                                        </View>
                                    </View>
                                </View>

                                <Text style={styles.historyTitle}>Oyun Geçmişi</Text>
                            </View>
                        ) : null
                    }
                />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 10, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16, paddingBottom: 30 },
    
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', marginTop: 20, marginBottom: 15, letterSpacing: 1 },
    statsPanel: { 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        padding: 20, 
        borderRadius: 30, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 30
    },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statsItem: { flex: 1, alignItems: 'center' },
    statsItemMain: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 10 },
    statsIcon: { fontSize: 22, marginBottom: 5 },
    statsLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
    statsValue: { color: '#fff', fontSize: 18, fontWeight: '900' },

    historyTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 15, marginLeft: 5 },

    card: { 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderRadius: 22, 
        marginBottom: 12, 
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)'
    },
    cardGrad: { padding: 18 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    gameBadge: { backgroundColor: '#43C6AC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    gameBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
    scoreText: { color: '#FFD700', fontSize: 22, fontWeight: '900' },
    dateText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 15 },
    detailGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    detailBox: { alignItems: 'flex-start' },
    detailLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 'bold', marginBottom: 2 },
    detailValue: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
