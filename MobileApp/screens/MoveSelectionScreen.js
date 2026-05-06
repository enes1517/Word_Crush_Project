/**
 * MoveSelectionScreen.js — Hamle Sayısı
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MoveSelectionScreen({ route, navigation }) {
    const { user, size } = route.params;

    const selectMoves = (moves) => {
        navigation.navigate('Game', { user, size, totalMoves: moves });
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <SafeAreaView style={styles.inner}>
                <Text style={styles.title}>Limitlerini Seç</Text>
                <Text style={styles.subtitle}>Oyun boyunca sahip olacağın toplam hamle sayısı</Text>

                <View style={styles.list}>
                    {[
                        { count: 15, label: 'Kısıtlı (Zor)', sub: '15 Hamle Hakkı', color: ['#8E2DE2', '#4A00E0'] },
                        { count: 20, label: 'Standart (Orta)', sub: '20 Hamle Hakkı', color: ['#00c6ff', '#0072ff'] },
                        { count: 25, label: 'Esnek (Kolay)', sub: '25 Hamle Hakkı', color: ['#f83600', '#f9d423'] },
                    ].map(opt => (
                        <TouchableOpacity key={opt.count} style={styles.card} onPress={() => selectMoves(opt.count)}>
                            <LinearGradient colors={opt.color} style={styles.cardGrad} start={{x:0, y:0}} end={{x:1, y:1}}>
                                <View>
                                    <Text style={styles.cardLabel}>{opt.label}</Text>
                                    <Text style={styles.cardSub}>{opt.sub}</Text>
                                </View>
                                <Text style={styles.arrow}>➔</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, padding: 25, justifyContent: 'center' },
    title: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 10 },
    subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 40, fontWeight: '600' },
    list: { width: '100%' },
    card: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 8 },
    cardGrad: { padding: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLabel: { color: '#fff', fontSize: 22, fontWeight: '900' },
    cardSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold', marginTop: 4 },
    arrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' }
});
