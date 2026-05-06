/**
 * GridSelectionScreen.js — Zorluk Seviyesi
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GridSelectionScreen({ route, navigation }) {
    const { user } = route.params;

    const selectGrid = (size) => {
        navigation.navigate('MoveSelection', { user, size });
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <SafeAreaView style={styles.inner}>
                <Text style={styles.title}>Stratejini Belirle</Text>
                <Text style={styles.subtitle}>Tahta boyutunu seçerek zorluğu ayarla</Text>

                <View style={styles.list}>
                    {[
                        { size: 6,  label: 'Zor Seviye',   sub: '6x6 Izgara', color: ['#ED213A', '#93291E'] },
                        { size: 8,  label: 'Orta Seviye',  sub: '8x8 Izgara', color: ['#FDC830', '#F37335'] },
                        { size: 10, label: 'Kolay Seviye', sub: '10x10 Izgara', color: ['#00b09b', '#96c93d'] },
                    ].map(opt => (
                        <TouchableOpacity key={opt.size} style={styles.card} onPress={() => selectGrid(opt.size)}>
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
