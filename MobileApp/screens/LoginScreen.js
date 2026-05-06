/**
 * LoginScreen.js — Word Crush Premium Giriş Ekranı
 * 
 * Görsel Özellikler:
 * - Animated Logo (Yavaşça aşağı yukarı süzülme)
 * - Modern, keskin ve canlı gradyanlar
 * - Premium buton tasarımı
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
    Animated, Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { loginUser } from '../api/api';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    // Logo Animasyonu
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        checkAutoLogin();

        // Süzülme efekti (Loop)
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: 1,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2500,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    const checkAutoLogin = async () => {
        try {
            const savedUsername = await AsyncStorage.getItem('@username');
            if (savedUsername) {
                const res = await loginUser(savedUsername);
                navigation.replace('Home', { user: res.data });
            } else {
                setLoading(false);
            }
        } catch (e) {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (username.trim().length < 3) return Alert.alert("Uyarı", "Kullanıcı adı en az 3 karakter olmalı!");

        setLoading(true);
        try {
            const res = await loginUser(username.trim());
            await AsyncStorage.setItem('@username', username.trim());
            navigation.replace('Home', { user: res.data });
        } catch (e) {
            Alert.alert("Hata", "Bağlantı kurulamadı. IP adresinizi kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const logoTranslateY = floatAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15]
    });

    if (loading && !username) {
        return (
            <LinearGradient colors={['#1a2a6c', '#b21f1f', '#fdbb2d']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Sistem Yükleniyor...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>

                <Animated.View style={[styles.logoContainer, { transform: [{ translateY: logoTranslateY }] }]}>
                    <Text style={styles.logoEmoji}>🧩</Text>
                    <Text style={styles.logoText}>Word Crush</Text>
                </Animated.View>

                <View style={styles.card}>
                    <Text style={styles.subtitle}>Eşsiz Bir Kelime Deneyimi</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Oyuncu İsmi Girin"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        <LinearGradient colors={['#FF416C', '#FF4B2B']} style={styles.gradientBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={styles.buttonText}>{loading ? 'GİRİŞ YAPILIYOR...' : 'OYUNA BAŞLA'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.footerInfo}>Yazlab 2 - Word Puzzle Game</Text>
                </View>

            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 15, fontWeight: 'bold' },
    inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25 },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logoEmoji: { fontSize: 80, textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 },
    logoText: { fontSize: 40, color: '#fff', fontWeight: '900', letterSpacing: 2, marginTop: 10 },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 30,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center'
    },
    subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 30, fontWeight: '600' },
    inputWrapper: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    input: {
        padding: 18,
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    button: { width: '100%', borderRadius: 15, overflow: 'hidden', elevation: 5 },
    gradientBtn: { padding: 18, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    footerInfo: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 25 }
});
