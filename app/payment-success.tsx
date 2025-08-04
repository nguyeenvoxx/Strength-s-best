import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const PaymentSuccessScreen: React.FC = () => {
  const router = useRouter();
  const { orderId, paymentId, method } = useLocalSearchParams();
  const { clearCart } = useCartStore();
  const { token } = useAuthStore();

  useEffect(() => {
    // Xóa giỏ hàng sau khi thanh toán thành công
    const clearCartItems = async () => {
      try {
        // Xóa từ AsyncStorage
        await AsyncStorage.removeItem('cart');
        console.log('Đã xóa giỏ hàng khỏi AsyncStorage');
        
        // Xóa từ store nếu có token
        if (token) {
          clearCart(token);
          console.log('Đã xóa giỏ hàng khỏi store');
        } else {
          console.log('Không có token, chỉ xóa local storage');
        }
      } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
      }
    };

    clearCartItems();
  }, [token]);

  const handleContinueShopping = () => {
    router.push('/(tabs)/home');
  };

  const handleViewOrders = () => {
    router.push('/purchased-orders');
  };

  const getPaymentMethodText = () => {
    switch (method) {
      case 'vnpay':
        return 'VNPay';
      case 'momo':
        return 'MoMo';
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      default:
        return 'Thanh toán';
    }
  };

  const getPaymentMethodIcon = () => {
    switch (method) {
      case 'vnpay':
        return 'card-outline';
      case 'momo':
        return 'phone-portrait-outline';
      case 'cod':
        return 'cash-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#469B43" />
        </View>
        
        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận.
        </Text>

        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
            <Text style={styles.infoValue}>{orderId || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã thanh toán:</Text>
            <Text style={styles.infoValue}>{paymentId || 'N/A'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức:</Text>
            <View style={styles.methodContainer}>
              <Ionicons name={getPaymentMethodIcon()} size={16} color="#469B43" />
              <Text style={styles.methodText}>{getPaymentMethodText()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
            <Ionicons name="home-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Tiếp tục mua sắm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrders}>
            <Ionicons name="list-outline" size={20} color="#469B43" />
            <Text style={styles.secondaryButtonText}>Xem đơn hàng</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  orderInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 14,
    color: '#469B43',
    fontWeight: '600',
    marginLeft: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#469B43',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#469B43',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#469B43',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PaymentSuccessScreen;
