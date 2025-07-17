import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { createVnpayPayment } from '../services/paymentApi';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../store/useAuthStore';

const VnpayPaymentScreen: React.FC = () => {
  const router = useRouter();
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Tạo orderId duy nhất
  const [orderId] = useState<string>(() => 'ODR-' + Date.now());
  const amount = 100000; // Lấy từ state/props nếu cần

  useEffect(() => {
    const fetchPaymentUrl = async () => {
      try {
        setLoading(true);
        const token = useAuthStore.getState().token;
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

  // Hàm xử lý khi WebView chuyển hướng về returnUrl
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url && url.startsWith('http://192.168.100.28:3000/vnpay_return')) {
      // Ở đây bạn có thể parse url để lấy trạng thái thanh toán
      // Sau đó chuyển hướng hoặc hiển thị thông báo thành công/thất bại
      Alert.alert('Thông báo', 'Thanh toán thành công!');
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