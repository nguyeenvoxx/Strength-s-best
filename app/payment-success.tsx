import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { getPlatformContainerStyle } from '@/utils/platformUtils';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

const PaymentSuccessScreen: React.FC = () => {
  const router = useRouter();
  const { selected } = useLocalSearchParams();
  const selectedItems = selected ? JSON.parse(selected as string) : [];
  const [orderId, setOrderId] = useState('');
  const { token } = useAuthStore();
  const { removeFromCart } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

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

        // Lưu đơn hàng vào purchased
        const updated = [...purchased, newOrder];
        await AsyncStorage.setItem('purchased', JSON.stringify(updated));

        // Xóa sản phẩm khỏi giỏ hàng sau khi thanh toán thành công
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
      } catch (err) {
        console.error('Lỗi lưu đơn hàng COD:', err);
      }
    };

    const loadSelectedAddress = async () => {
      try {
        const savedAddress = await AsyncStorage.getItem('selectedDeliveryAddress');
        if (savedAddress) {
          setSelectedAddress(JSON.parse(savedAddress));
        }
      } catch (error) {
        console.error('Lỗi khi tải địa chỉ:', error);
      }
    };

    if (selectedItems.length > 0) {
      saveOrder();
    }
    loadSelectedAddress();
  }, []);

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#28a745" />
        </View>

        <Text style={styles.title}>Thanh toán thành công!</Text>
        <Text style={styles.message}>
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao sớm nhất.
        </Text>

        {/* Thông tin giao hàng */}
        {selectedAddress && (
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            <View style={styles.deliveryInfo}>
              <Ionicons name="location-outline" size={20} color="#469B43" />
              <View style={styles.deliveryText}>
                <Text style={styles.deliveryName}>{selectedAddress.name}</Text>
                <Text style={styles.deliveryAddress}>{selectedAddress.address}</Text>
                <Text style={styles.deliveryPhone}>SĐT: {selectedAddress.phone}</Text>
              </View>
            </View>
          </View>
        )}

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
  deliverySection: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#469B43',
    marginBottom: 10,
    textAlign: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryText: {
    marginLeft: 10,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deliveryPhone: {
    fontSize: 14,
    color: '#007bff',
    marginTop: 2,
  },
});

export default PaymentSuccessScreen;
