import { Stack } from 'expo-router';
import React from 'react';


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)/cart" options={{ headerShown: true }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Sản phẩm' }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="payment-success" options={{ title: 'Thanh toán thành công' }} />
      <Stack.Screen name="qr-payment" options={{ title: 'Thanh toán QR' }} />
      <Stack.Screen name="order-summary" options={{ title: 'Đơn đã mua' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Chỉnh sửa thông tin' }} />
      <Stack.Screen name="change-password" options={{ title: 'Đổi mật khẩu' }} />
      <Stack.Screen name="purchased-orders" options={{ title: 'Đơn hàng đã mua' }} />

    </Stack>

  );
}
