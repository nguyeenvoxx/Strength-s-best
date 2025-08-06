import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import { useSettingStore } from '../store/useSettingStore';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
  const router = useRouter();
  const { isFirstTime, hasHydrated } = useSettingStore();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Đợi store được hydrate xong
    if (!hasHydrated) return;
    
    // Delay navigation to ensure app is fully loaded
    const timer = setTimeout(() => {
      try {
        if (isFirstTime) {
          // Lần đầu sử dụng - chuyển đến welcome
          router.replace('/(auth)/splash');
        } else if (isAuthenticated) {
          // Đã đăng nhập - chuyển đến products
          router.replace('/products');
        } else {
          // Chưa đăng nhập - chuyển đến sign-in
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router, isFirstTime, hasHydrated, isAuthenticated]);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#469B43" />
      <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
    </View>
  );
}
