/**
 * MarketScreen.js — Word Crush Premium Market
 * 
 * Görsel Özellikler:
 * - Renkli Cam Efekti Kartlar
 * - Gradient Butonlar
 * - Modern Tipografi ve İkonografi
 */

import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const JOKERS = [
    {
        name:   'Lolipop',
        icon:   '🍭',
        price:  75,
        color:  ['#FF416C', '#FF4B2B'],
        desc:   'İstediğiniz bir harfi siler.',
        purpose:'Engelleyici harfleri kaldırın.',
        usage:  'Dokunulan hücreyi patlatır.',
    },
    {
        name:   'Balık',
        icon:   '🐟',
        price:  100,
        color:  ['#00c6ff', '#0072ff'],
        desc:   'Rastgele 3 harfi patlatır.',
        purpose:'Tahtayı hızlıca ferahlatın.',
        usage:  'Butona basıldığında otomatik uygulanır.',
    },
    {
        name:   'Serbest Değiştirme',
        icon:   '🔄',
        price:  125,
        color:  ['#AC92EB', '#6B5B95'],
        desc:   'İki harfin yerini değiştirir.',
        purpose:'Harfleri yan yana getirin.',
        usage:  'Önce 1. harfe, sonra 2. harfe dokunun.',
    },
    {
        name:   'Tekerlek',
        icon:   '🎡',
        price:  200,
        color:  ['#F7B731', '#E17055'],
        desc:   'Satır ve sütun temizler.',
        purpose:'Büyük alanları tek hamlede silin.',
        usage:  'Seçilen hücrenin satır/sütununu temizler.',
    },
    {
        name:   'Karıştırma',
        icon:   '🔀',
        price:  300,
        color:  ['#4FC3F7', '#2196F3'],
        desc:   'Tüm harfleri karıştırır.',
        purpose:'Çıkmazdan kurtulun.',
        usage:  'Mevcut harflerin yerlerini değiştirir.',
    },
    {
        name:   'Parti Güçlendiricisi',
        icon:   '🎉',
        price:  400,
        color:  ['#9D50BB', '#6E48AA'],
        desc:   'Tüm tahtayı sıfırlar.',
        purpose:'Tamamen yeni bir tahta elde edin.',
        usage:  'Tüm harfleri siler ve yenilerini üretir.',
    },
];

export default function MarketScreen({ route }) {
    const user = route?.params?.user;

    const handleInfo = (joker) => {
        Alert.alert(
            `${joker.icon} ${joker.name}`,
            `${joker.desc}\n\nKullanım: ${joker.usage}\n\nOyun içi market çubuğundan anlık satın alabilirsiniz.`,
            [{ text: 'Anladım', style: 'default' }]
        );
    };

    return (
        <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Premium Market</Text>
                    {user && (
                        <View style={styles.goldBadge}>
                            <Text style={styles.goldBadgeText}>💰 {user.totalGold} ALTIN</Text>
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {JOKERS.map((j) => (
                        <View key={j.name} style={styles.card}>
                            <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.cardGrad}>
                                <View style={styles.cardTop}>
                                    <View style={styles.iconCircle}>
                                        <Text style={styles.icon}>{j.icon}</Text>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.jokerName}>{j.name}</Text>
                                        <Text style={styles.jokerPrice}>Maliyet: {j.price} Altın</Text>
                                    </View>
                                </View>

                                <Text style={styles.jokerDesc}>{j.desc}</Text>
                                <Text style={styles.jokerPurpose}>{j.purpose}</Text>

                                <TouchableOpacity onPress={() => handleInfo(j)} style={styles.btnWrapper}>
                                    <LinearGradient colors={j.color} style={styles.btn} start={{x:0, y:0}} end={{x:1, y:0}}>
                                        <Text style={styles.btnText}>BİLGİ VE DETAY</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    ))}
                    
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerText}>Jokerler oyun esnasında alt bardan anlık alınır.</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        padding: 20, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
    goldBadge: { backgroundColor: 'rgba(255,215,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)' },
    goldBadgeText: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },

    scroll: { padding: 15, paddingBottom: 40 },
    card: { borderRadius: 25, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardGrad: { padding: 20 },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconCircle: { width: 55, height: 55, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    icon: { fontSize: 28 },
    jokerName: { color: '#fff', fontSize: 18, fontWeight: '900' },
    jokerPrice: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginTop: 2 },
    jokerDesc: { color: '#ccc', fontSize: 14, fontWeight: '600', marginBottom: 5 },
    jokerPurpose: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 20 },
    
    btnWrapper: { borderRadius: 12, overflow: 'hidden' },
    btn: { paddingVertical: 12, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1 },

    footerInfo: { marginTop: 10, alignItems: 'center' },
    footerText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 }
});
