import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { createVnpayPayment } from '../services/paymentApi';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VnpayPaymentScreen: React.FC = () => {
  const router = useRouter();
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const { removeFromCart } = useCartStore();
  const { selected } = useLocalSearchParams();
  const selectedItems = selected ? JSON.parse(selected as string) : [];

  // Tạo orderId duy nhất
  const [orderId] = useState<string>(() => 'ODR-' + Date.now());
  const amount = selectedItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const fetchPaymentUrl = async () => {
      try {
        setLoading(true);
        const { paymentUrl } = await createVnpayPayment(amount, orderId);
        setPaymentUrl(paymentUrl);
      } catch (error: any) {
        Alert.alert(
          'Lỗi',
          error?.response?.data?.message || error?.message || 'Không thể tạo thanh toán VNPAY'
        );
        setPaymentUrl(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentUrl();
  }, [amount, orderId]);

  // Hàm xóa sản phẩm khỏi giỏ hàng sau khi thanh toán thành công
  const removeItemsFromCart = async () => {
    if (token && selectedItems.length > 0) {
      try {
        // Xóa từng sản phẩm đã thanh toán khỏi giỏ hàng
        for (const item of selectedItems) {
          if (item._id || item.id) {
            await removeFromCart(token, item._id || item.id);
            console.log(`Đã xóa sản phẩm ${item._id || item.id} khỏi giỏ hàng`);
          }
        }
        
        // Cũng xóa từ AsyncStorage để đảm bảo
        const cart = await AsyncStorage.getItem('cart');
        if (cart) {
          const cartItems = JSON.parse(cart);
          const selectedItemIds = selectedItems.map((item: any) => item._id || item.id);
          const newCart = cartItems.filter(
            (item: any) => !selectedItemIds.includes(item.idProduct?._id || item._id || item.id)
          );
          await AsyncStorage.setItem('cart', JSON.stringify(newCart));
          console.log('Đã cập nhật AsyncStorage cart');
        }


      } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
      }
    }
  };

  // Hàm xử lý khi WebView chuyển hướng về returnUrl
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url && url.startsWith('http://192.168.100.28:3000/vnpay_return')) {
      // Xóa sản phẩm khỏi giỏ hàng trước khi chuyển hướng
      removeItemsFromCart();
      router.push('/payment-success'); // hoặc route khác tuỳ bạn
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#469B43" />
        <Text>Đang tạo thanh toán VNPAY...</Text>
      </View>
    );
  }

  if (!paymentUrl) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Không thể tạo thanh toán. Vui lòng thử lại sau.</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#469B43" />
          <Text>Đang tải trang thanh toán...</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default VnpayPaymentScreen;