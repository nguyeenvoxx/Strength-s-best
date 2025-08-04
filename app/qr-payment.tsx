import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const QRPaymentScreen: React.FC = () => {
  const router = useRouter();
  const { method, orderId, paymentId, paymentUrl } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setIsLoading(false);
      // In a real app, you would check payment status from backend
      setPaymentStatus('success');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handlePaymentSuccess = () => {
    Alert.alert(
      'Thanh toán thành công',
      'Cảm ơn bạn đã mua hàng!',
      [
        {
          text: 'Xem đơn hàng',
          onPress: () => router.push('/purchased-orders')
        },
        {
          text: 'Tiếp tục mua sắm',
          onPress: () => router.push('/(tabs)/home')
        }
      ]
    );
  };

  const handlePaymentFailure = () => {
    Alert.alert(
      'Thanh toán thất bại',
      'Vui lòng thử lại hoặc chọn phương thức thanh toán khác.',
      [
        {
          text: 'Thử lại',
          onPress: () => router.back()
        },
        {
          text: 'Về trang chủ',
          onPress: () => router.push('/(tabs)/home')
        }
      ]
    );
  };

  const getPaymentMethodInfo = () => {
    switch (method) {
      case 'vnpay':
        return {
          name: 'VNPay',
          icon: 'card-outline' as const,
          color: '#0055A4'
        };
      case 'momo':
        return {
          name: 'MoMo',
          icon: 'phone-portrait-outline' as const,
          color: '#A50064'
        };
      default:
        return {
          name: 'Thanh toán',
          icon: 'qr-code-outline' as const,
          color: '#007AFF'
        };
    }
  };

  const paymentInfo = getPaymentMethodInfo();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paymentInfo.color} />
          <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
          <Text style={styles.loadingSubtext}>
            Vui lòng hoàn tất thanh toán trên ứng dụng {paymentInfo.name}
          </Text>
        </View>
      </View>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#469B43" />
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>
          <Text style={styles.successSubtitle}>
            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </Text>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
            <Text style={styles.orderValue}>{orderId || 'N/A'}</Text>
            
            <Text style={styles.orderLabel}>Mã thanh toán:</Text>
            <Text style={styles.orderValue}>{paymentId || 'N/A'}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handlePaymentSuccess}
            >
              <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <View style={styles.container}>
        <View style={styles.failureContainer}>
          <Ionicons name="close-circle" size={80} color="#FF3B30" />
          <Text style={styles.failureTitle}>Thanh toán thất bại</Text>
          <Text style={styles.failureSubtitle}>
            Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={handlePaymentFailure}
            >
              <Text style={styles.primaryButtonText}>Thử lại</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // QR Code Payment Interface
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán {paymentInfo.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.qrContainer}>
          <View style={styles.qrHeader}>
            <Ionicons name={paymentInfo.icon} size={32} color={paymentInfo.color} />
            <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
          </View>
          
          <View style={styles.qrCodeContainer}>
            <Image 
              source={{ uri: (paymentUrl as string) || 'https://via.placeholder.com/200x200?text=QR+Code' }}
              style={styles.qrCode}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.qrInstructions}>
            Mở ứng dụng {paymentInfo.name} và quét mã QR bên trên để hoàn tất thanh toán
          </Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.orderDetailsTitle}>Thông tin đơn hàng</Text>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Mã đơn hàng:</Text>
            <Text style={styles.orderDetailValue}>{orderId || 'N/A'}</Text>
          </View>
          <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailLabel}>Phương thức:</Text>
            <Text style={styles.orderDetailValue}>{paymentInfo.name}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => setPaymentStatus('success')}
          >
            <Text style={styles.primaryButtonText}>Đã thanh toán xong</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Hủy thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#469B43',
    marginTop: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  orderInfo: {
    marginTop: 24,
    width: '100%',
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  failureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  failureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
    textAlign: 'center',
  },
  failureSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  orderDetails: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QRPaymentScreen; 