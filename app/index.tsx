import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSettingStore } from '../store/useSettingStore';

export default function Index() {
  const { isFirstTime, hasHydrated } = useSettingStore();

  useEffect(() => {
    // Đợi store được hydrate xong
    if (!hasHydrated) return;
    
    // Delay navigation to ensure app is fully loaded
    const timer = setTimeout(() => {
      try {
        if (isFirstTime) {
          // Lần đầu sử dụng - chuyển đến splash
          router.replace('/(auth)/splash');
        } else {
          // Không phải lần đầu - chuyển đến home
          router.replace('/home');
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isFirstTime, hasHydrated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#469B43" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
