import { Stack } from 'expo-router';
import React from 'react';


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Sản phẩm', headerShown: false }} />
      <Stack.Screen name="checkout" options={{ title: 'Thanh toán' }} />
      <Stack.Screen name="payment-success" options={{ title: 'Thanh toán thành công' }} />
      <Stack.Screen name="qr-payment" options={{ title: 'Thanh toán QR' }} />
      <Stack.Screen name="order-summary" options={{ title: 'Kiểm tra hàng hóa' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Chỉnh sửa thông tin', headerShown: false }} />
      <Stack.Screen name="change-password" options={{ title: 'Đổi mật khẩu' }} />
      <Stack.Screen name="purchased-orders" options={{ title: 'Đơn hàng đã mua' }} />
      <Stack.Screen name="products" options={{ headerShown: false }} />
      <Stack.Screen name="select-address" options={{ title: 'Chọn địa chỉ nhận hàng', headerShown: false }} />
      <Stack.Screen name="add-address" options={{ title: 'Thêm địa chỉ mới', headerShown: false }} />
      <Stack.Screen name="edit-address" options={{ title: 'Chỉnh sửa địa chỉ', headerShown: false }} />
    </Stack>
  );
}
