import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ScoreScreen from './screens/ScoreScreen';
import GameScreen from './screens/GameScreen';
import MarketScreen from './screens/MarketScreen';
import GridSelectionScreen from './screens/GridSelectionScreen';
import MoveSelectionScreen from './screens/MoveSelectionScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        
        <Stack.Screen 
          name="Score" 
          component={ScoreScreen} 
          options={{ 
            headerShown: true, 
            title: "Skor Tablosu",
            headerStyle: { backgroundColor: '#232526' },
            headerTintColor: '#fff'
          }} 
        />
        
        <Stack.Screen 
          name="GridSelection" 
          component={GridSelectionScreen} 
          options={{ 
            headerShown: true, 
            title: "Boyut Seçimi",
            headerStyle: { backgroundColor: '#141E30' },
            headerTintColor: '#fff'
          }} 
        />

        <Stack.Screen 
          name="MoveSelection" 
          component={MoveSelectionScreen} 
          options={{ 
            headerShown: true, 
            title: "Hamle Seçimi",
            headerStyle: { backgroundColor: '#141E30' },
            headerTintColor: '#fff'
          }} 
        />
        
        <Stack.Screen 
          name="Market" 
          component={MarketScreen} 
          options={{ 
            headerShown: true, 
            title: "Joker Market",
            headerStyle: { backgroundColor: '#141E30' },
            headerTintColor: '#FFD700'
          }} 
        />
        
        <Stack.Screen 
          name="Game" 
          component={GameScreen} 
          options={{ 
            headerShown: true, 
            title: "Oyun Ekranı",
            headerStyle: { backgroundColor: '#0f2027' },
            headerTintColor: '#fff',
            headerBackVisible: false // Oyundayken geri tuşuna basıp çıkmasını engellemek için kendi butonumuzu koyarız
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
