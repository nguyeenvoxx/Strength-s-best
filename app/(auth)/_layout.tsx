import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ title: 'Đăng kí' }} />
      <Stack.Screen name="email-verification" options={{ title: 'Xác thực email' }} />
      <Stack.Screen name="reset-password" options={{ title: 'Đổi mật khẩu' }} />
      <Stack.Screen name="create-account-success" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Quên mật khẩu?' }} />
    </Stack>
  );
}
