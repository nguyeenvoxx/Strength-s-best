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
    if (authHydrated && settingHydrated) {
      setIsReady(true);
    }
  }, [authHydrated, settingHydrated]);

  if (!isReady) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }, getPlatformContainerStyle()]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isFirstTime) {
    return <Redirect href="/(auth)/splash" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
