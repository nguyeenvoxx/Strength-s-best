import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';

export default function TabsLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          paddingVertical: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
          height: 80,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Image 
              source={require('../../assets/images/home_icon.png')} 
              style={{ 
                width: 23, 
                height: 23,
                tintColor: color
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Image 
              source={require('../../assets/images/heart_icon.png')} 
              style={{ 
                width: 25, 
                height: 20,
                tintColor: color
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 50,
              height: 50,
              backgroundColor: '#469B43',
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            }}>
              <Feather name="shopping-cart" size={24} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Image 
              source={require('../../assets/images/search_icon.png')} 
              style={{ 
                width: 24, 
                height: 24,
                tintColor: color
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Image 
              source={require('../../assets/images/settings_icon.png')} 
              style={{ 
                width: 24, 
                height: 24,
                tintColor: color
              }} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
