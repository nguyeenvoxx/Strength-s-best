import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useAuthStore } from '../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { selected, id, total, date, voucher, status, customerName, customerPhone, customerAddress, customerEmail } = useLocalSearchParams();
  const orderItems = selected ? JSON.parse(selected as string) : [];
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [localStatus, setLocalStatus] = useState(status);

  const formatPrice = (price: number | null | undefined) => {
    if (typeof price !== 'number' || isNaN(price)) return '0 đ';
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const totalQuantity = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);

  const user = useAuthStore.getState().user;
  const newOrder = {
    id: 'ODR-' + Date.now(),
    items: orderItems,
    total: totalPrice,
    date: new Date().toISOString(),
    voucher: voucher,
    status: status,
    customerName: user?.name || '',
    customerPhone: user?.phoneNumber || '',
    customerAddress: user?.address || '',
  };

  React.useEffect(() => {
    const saveOrder = async () => {
      const existing = await AsyncStorage.getItem('purchased');
      const purchased = existing ? JSON.parse(existing) : [];
      const updated = [...purchased, newOrder];
      await AsyncStorage.setItem('purchased', JSON.stringify(updated));
    };
    saveOrder();
  }, []);

  React.useEffect(() => {
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
    loadSelectedAddress();
  }, []);

  // Lấy thông tin đơn hàng từ params nếu có
  const orderId = id || newOrder.id;
  const orderDate = date ? new Date(date as string) : new Date(newOrder.date);
  const orderTotal = total ? Number(total) : newOrder.total;
  const orderQuantity = orderItems.length > 0 ? orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.header}>Xem đơn hàng</Text>
      
      {/* Thông tin giao hàng
      <View style={styles.deliverySection}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <View style={styles.deliveryInfo}>
          <Ionicons name="location-outline" size={20} color="#469B43" />
          <View style={styles.deliveryText}>
            <Text style={styles.deliveryName}>
              {selectedAddress?.name || customerName || user?.name || 'Khách hàng'}
            </Text>
            <Text style={styles.deliveryAddress}>
              {selectedAddress?.address || customerAddress || user?.address || 'Chưa có địa chỉ'}
            </Text>
            <Text style={styles.deliveryPhone}>
              SĐT: {selectedAddress?.phone || customerPhone || user?.phone || 'Chưa có số điện thoại'}
            </Text>
          </View>
        </View>
      </View> */}

      {/* Thông tin người đặt */}
      <View style={styles.customerBox}>
        <Text style={styles.customerTitle}>Thông tin người đặt</Text>
        <Text style={[styles.customerInfo, { fontWeight: 'bold' }]}>{customerName || user?.name || 'Không rõ'}</Text>
        <Text style={styles.customerInfo}>Địa chỉ: {customerAddress || user?.address || 'Không rõ'}</Text>
        <Text style={styles.customerInfo}>SĐT: {(customerPhone && customerPhone !== 'null' && customerPhone !== 'undefined') ? customerPhone : (user?.phoneNumber || 'Không rõ')}</Text>
      </View>
      
      <Text style={styles.orderInfo}>Mã đơn hàng: {orderId}</Text>
      <Text style={styles.orderInfo}>Ngày: {orderDate.toString() !== 'Invalid Date' ? orderDate.toLocaleDateString('vi-VN') : 'Không rõ'}</Text>
      {voucher && <Text style={styles.orderInfo}>Mã giảm giá: {voucher}</Text>}
      <Text style={styles.orderInfo}>Tổng tiền (lưu): {formatPrice(orderTotal)}</Text>
      
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>Chi tiết sản phẩm</Text>
        {orderItems.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <Image 
              source={{ uri: item.image || item.idProduct?.image }} 
              style={styles.itemImage} 
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name || item.idProduct?.nameProduct}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)} x {item.quantity}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      {/* Control View: Trạng thái, Hủy đơn, Mua lại */}
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={{
          color: localStatus === 'cancelled' ? 'red' : '#28a745',
          fontWeight: 'bold',
          marginBottom: 8,
        }}>
          {localStatus === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
        </Text>
        {localStatus !== 'cancelled' && (
          <TouchableOpacity
            style={{ backgroundColor: '#ff4d4d', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8, marginBottom: 10 }}
            onPress={() => setLocalStatus('cancelled')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Hủy đơn</Text>
          </TouchableOpacity>
        )}
        {localStatus === 'cancelled' && (
          <TouchableOpacity
            style={{ backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 }}
            onPress={() => Alert.alert('Mua lại', 'Chức năng mua lại sẽ được cập nhật!')}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Mua lại</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng số lượng:</Text>
          <Text style={styles.summaryValue}>{orderQuantity}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng tiền:</Text>
          <Text style={styles.summaryValue}>{formatPrice(orderTotal)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.push('./(tabs)/home')}
      >
        <Text style={styles.backButtonText}>Về trang chủ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  deliverySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryText: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deliveryPhone: {
    fontSize: 14,
    color: '#666',
  },
  customerBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  customerInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  itemsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#469B43',
  },
  summarySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    backgroundColor: '#469B43',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
