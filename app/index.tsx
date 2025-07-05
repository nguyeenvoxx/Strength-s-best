import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingStore } from '../store/useSettingStore';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import React from 'react';

export default function IndexPage() {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, hasHydrated: authHydrated } = useAuthStore();
  const { isFirstTime, hasHydrated: settingHydrated } = useSettingStore();

  useEffect(() => {
    // Đợi cả auth store và setting store được hydrate
    if (authHydrated && settingHydrated) {
      setIsReady(true);
    }
  }, [authHydrated, settingHydrated]);

  // Hiển thị loading trong khi đợi stores hydrate
  if (!isReady) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, getPlatformContainerStyle()]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Nếu là lần đầu tiên mở app, hiển thị splash
  if (isFirstTime) {
    return <Redirect href="/(auth)/splash" />;
  }

  // Nếu đã đăng nhập, vào home
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  // Nếu chưa đăng nhập, vào login
  return <Redirect href="/(auth)/sign-in" />;
}
