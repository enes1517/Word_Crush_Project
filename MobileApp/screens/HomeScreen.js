/**
 * HomeScreen.js — Word Crush Premium Ana Menü
 * 
 * Özellikler:
 * - Gelişmiş cam efekti (Glassmorphism) header
 * - Glossy (parlak) Yeni Oyun butonu
 * - Altın animasyonu ve canlı renkler
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, 
    SafeAreaView, StatusBar, Alert, Animated 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { loginUser } from '../api/api';

export default function HomeScreen({ route, navigation }) {
    const [user, setUser] = useState(route.params.user);
    const goldPulse = useRef(new Animated.Value(1)).current;

    useFocusEffect(
        React.useCallback(() => {
            const fetchGold = async () => {
                try {
                    const res = await loginUser(user.username);
                    setUser(res.data);
                    
                    // Altın değiştiğinde hafif bir darbe efekti
                    Animated.sequence([
                        Animated.timing(goldPulse, { toValue: 1.2, duration: 150, useNativeDriver: true }),
                        Animated.spring(goldPulse, { toValue: 1, friction: 4, useNativeDriver: true })
                    ]).start();
                } catch (e) { }
            };
            fetchGold();
        }, [user.username])
    );

    const handleLogout = () => {
        Alert.alert("Profil", `${user.username} olarak giriş yapıldı. İsim değiştirmek ister misiniz?`, [
            { text: "İptal", style: "cancel" },
            { 
                text: "Çıkış Yap", 
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem('@username');
                    navigation.replace('Login');
                }
            }
        ]);
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <SafeAreaView style={{ flex: 1, width: '100%' }}>
                <StatusBar barStyle="light-content" />
                
                {/* MODERN HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleLogout} style={styles.profileSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text style={styles.welcomeText}>Hoş Geldin,</Text>
                            <Text style={styles.username}>{user.username}</Text>
                        </View>
                    </TouchableOpacity>

                    <Animated.View style={[styles.goldBox, { transform: [{ scale: goldPulse }] }]}>
                        <Text style={styles.goldIcon}>💰</Text>
                        <Text style={styles.goldText}>{user.totalGold}</Text>
                    </Animated.View>
                </View>

                {/* ANA İÇERİK */}
                <View style={styles.content}>
                    <Text style={styles.mainTitle}>Bulmacaya{"\n"}Hazır Mısın?</Text>
                    
                    <TouchableOpacity 
                        style={styles.playButton} 
                        onPress={() => navigation.navigate('GridSelection', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient 
                            colors={['#00c6ff', '#0072ff']} 
                            style={styles.btnGradient} 
                            start={{ x: 0, y: 0 }} 
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.btnTitle}>🎮 YENİ OYUN BAŞLAT</Text>
                            <Text style={styles.btnSubTitle}>Farklı zorluk seviyeleri</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ALT KARTLAR */}
                <View style={styles.bottomRow}>
                    <TouchableOpacity 
                        style={styles.bottomBtn} 
                        onPress={() => navigation.navigate('Score', { user })}
                    >
                        <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.bottomBtnGrad}>
                            <Text style={styles.bottomEmoji}>🏆</Text>
                            <Text style={styles.bottomText}>Skorlarım</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.bottomBtn} 
                        onPress={() => navigation.navigate('Market', { user })}
                    >
                        <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.bottomBtnGrad}>
                            <Text style={styles.bottomEmoji}>🛒</Text>
                            <Text style={styles.bottomText}>Market</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginTop: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 25,
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    avatar: { 
        width: 45, height: 45, 
        backgroundColor: '#43C6AC', 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 12 
    },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    welcomeText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' },
    username: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    goldBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.3)', 
        paddingHorizontal: 14, 
        paddingVertical: 8, 
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.3)'
    },
    goldIcon: { fontSize: 18, marginRight: 6 },
    goldText: { color: '#FFD700', fontSize: 18, fontWeight: '900' },
    
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    mainTitle: { color: '#fff', fontSize: 44, fontWeight: '900', marginBottom: 40, lineHeight: 52 },
    playButton: { 
        borderRadius: 25, 
        overflow: 'hidden', 
        elevation: 10, 
        shadowColor: '#00c6ff', 
        shadowOffset: { width: 0, height: 10 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 20 
    },
    btnGradient: { paddingVertical: 25, alignItems: 'center' },
    btnTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
    btnSubTitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, fontWeight: 'bold' },
    
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginBottom: 20
    },
    bottomBtn: { width: '48%', borderRadius: 20, overflow: 'hidden' },
    bottomBtnGrad: { 
        paddingVertical: 20, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)' 
    },
    bottomEmoji: { fontSize: 28, marginBottom: 8 },
    bottomText: { color: '#fff', fontSize: 14, fontWeight: '800' }
});
