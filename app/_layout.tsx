import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { ThemeProvider } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { useTheme } from '../store/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootTabsLayout />
    </ThemeProvider>
  );
}

function RootTabsLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#469B43',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          paddingVertical: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
          height: 70,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Favorite */}
      <Tabs.Screen
        name="favorite"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'heart' : 'heart-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Cart */}
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 45,
              height: 45,
              backgroundColor: '#469B43',
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 3,
              shadowColor: '#469B43',
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            }}>
              <Feather name="shopping-cart" size={22} color="#fff" />
            </View>
          ),
        }}
      />
      
      {/* Search */}
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'search' : 'search-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* Hidden screens - ẩn hoàn toàn khỏi bottom tabs */}
      <Tabs.Screen name="(auth)" options={{ href: null }} />
      <Tabs.Screen name="product" options={{ href: null }} />
      <Tabs.Screen name="products" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="payment-success" options={{ href: null }} />
      <Tabs.Screen name="qr-payment" options={{ href: null }} />
      <Tabs.Screen name="order-summary" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="change-password" options={{ href: null }} />
      <Tabs.Screen name="purchased-orders" options={{ href: null }} />
      <Tabs.Screen name="select-address" options={{ href: null }} />
      <Tabs.Screen name="add-address" options={{ href: null }} />
      <Tabs.Screen name="edit-address" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="rewards" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="add-card" options={{ href: null }} />
      <Tabs.Screen name="verify-card" options={{ href: null }} />
      <Tabs.Screen name="my-cards" options={{ href: null }} />
      <Tabs.Screen name="verify-payment" options={{ href: null }} />
      <Tabs.Screen name="order-detail" options={{ href: null }} />
    </Tabs>
  );
}