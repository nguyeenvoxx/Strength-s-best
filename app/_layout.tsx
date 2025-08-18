import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import React from 'react';
import { ThemeProvider } from '../store/ThemeContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_CONFIG } from '../constants/config';
import { LightColors, DarkColors } from '../constants/Colors';
import { useTheme } from '../store/ThemeContext';
import { useCartStore } from '../store/useCartStore';
import { useFavoriteStore } from '../store/useFavoriteStore';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StripeProvider publishableKey={STRIPE_CONFIG.PUBLISHABLE_KEY}>
        <RootTabsLayout />
      </StripeProvider>
    </ThemeProvider>
  );
}

function RootTabsLayout() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const { items } = useCartStore();
  const { favorites } = useFavoriteStore();
  
  // Tính số lượng sản phẩm khác nhau trong giỏ hàng
  const totalItems = items.length;
  
  // Tính số lượng sản phẩm yêu thích
  const totalFavorites = favorites.length;

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
            <View style={{ position: 'relative' }}>
              <Ionicons 
                name={focused ? 'heart' : 'heart-outline'} 
                size={24} 
                color={color} 
              />
              {totalFavorites > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: '#FF4444',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {totalFavorites > 99 ? '99+' : totalFavorites}
                  </Text>
                </View>
              )}
            </View>
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
              <Ionicons name="cart" size={22} color="#fff" />
              {totalItems > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: '#FF4444',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </Text>
                </View>
              )}
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
      <Tabs.Screen name="product/[id]" options={{ href: null }} />
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
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="add-card" options={{ href: null }} />
      <Tabs.Screen name="verify-card" options={{ href: null }} />
      <Tabs.Screen name="my-cards" options={{ href: null }} />
      <Tabs.Screen name="verify-payment" options={{ href: null }} />
      <Tabs.Screen name="order-detail" options={{ href: null }} />
      <Tabs.Screen name="order-detail/[id]" options={{ href: null }} />
      <Tabs.Screen name="news" options={{ href: null }} />
      <Tabs.Screen name="news-detail" options={{ href: null }} />
      <Tabs.Screen name="help/ordering-guide" options={{ href: null }} />
      <Tabs.Screen name="help/return-policy" options={{ href: null }} />
      <Tabs.Screen name="help/shipping-info" options={{ href: null }} />
      <Tabs.Screen name="help/security-policy" options={{ href: null }} />
      <Tabs.Screen name="help/contact" options={{ href: null }} />
      <Tabs.Screen name="contact" options={{ href: null }} />
    </Tabs>
  );
}