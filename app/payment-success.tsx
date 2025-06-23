import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';



const PaymentSuccessScreen: React.FC = () => {
  const router = useRouter();
  const { selected } = useLocalSearchParams();
  const selectedItems = selected ? JSON.parse(selected as string) : [];
  const [orderId, setOrderId] = useState('');
  useEffect(() => {

    const saveOrder = async () => {
      try {
        const existing = await AsyncStorage.getItem('purchased');
        const purchased = existing ? JSON.parse(existing) : [];

        const orderIdGenerated = 'ODR-' + Date.now();

        const newOrder = {
          id: orderIdGenerated,
          items: selectedItems,
          total: selectedItems.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
          ),
          date: new Date().toISOString(),
        };

        setOrderId(orderIdGenerated);


        const updated = [...purchased, newOrder];
        await AsyncStorage.setItem('purchased', JSON.stringify(updated));

        // (tùy chọn) xoá khỏi giỏ hàng
        const cart = await AsyncStorage.getItem('cart');
        if (cart) {
          const cartItems = JSON.parse(cart);
          const newCart = cartItems.filter(
            (item: any) => !selectedItems.find((sel: any) => sel.id === item.id)
          );
          await AsyncStorage.setItem('cart', JSON.stringify(newCart));
        }
      } catch (err) {
        console.error('Lỗi lưu đơn hàng COD:', err);
      }
    };

    if (selectedItems.length > 0) {
      saveOrder();
    }
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#28a745" />
        </View>

        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.message}>
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao sớm nhất.
        </Text>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
          <Text style={styles.orderNumber}>
            {orderId ? orderId : 'Đang xử lý...'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('./order-summary')}
        >
          <Text style={styles.buttonText}>Xem đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('./(tabs)/home')}
        >
          <Text style={styles.secondaryButtonText}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  orderInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  button: {
    backgroundColor: '#469B43',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007bff',
    width: '80%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;
