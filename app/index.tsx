import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Delay navigation to ensure app is fully loaded
    const timer = setTimeout(() => {
      try {
        // Điều hướng đến trang home thay vì products
        router.replace('/(tabs)/home');
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={{ marginTop: 10, color: '#666' }}>Đang tải...</Text>
    </View>
  );
}
