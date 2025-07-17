import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useAuthStore } from '../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function OrderSummaryScreen() {
  const router = useRouter();
  const { selected, id, total, date, voucher, status, customerName, customerPhone, customerAddress, customerEmail } = useLocalSearchParams();
  const orderItems = selected ? JSON.parse(selected as string) : [];

  const formatPrice = (price: number) => {
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



  return (

    <View style={styles.container}>
      <Text style={styles.header}>Xem đơn hàng</Text>
      <View style={styles.customerBox}>
        <Text style={styles.customerTitle}>Thông tin người đặt</Text>
        <Text style={[styles.customerInfo, { fontWeight: 'bold' }]}>{newOrder.customerName || 'Không rõ'}</Text>
        <Text style={styles.customerInfo}>Địa chỉ: {newOrder.customerAddress || 'Không rõ'}</Text>
        <Text style={styles.customerInfo}>SĐT: {newOrder.customerPhone || 'Không rõ'}</Text>
      </View>
      <Text style={styles.orderInfo}>Mã đơn hàng: {id}</Text>
      <Text style={styles.orderInfo}>Ngày: {new Date(date as string).toLocaleDateString('vi-VN')}</Text>
      {voucher && <Text style={styles.orderInfo}>Mã giảm giá: {voucher}</Text>}
      <Text style={styles.orderInfo}>Tổng tiền (lưu): {formatPrice(Number(total))}</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orderItems.map((item: any, index: number) =>
          item ? (
            <View key={item.id ?? index} style={styles.card}>
              <Image
                source={typeof item.image === 'number' ? item.image : { uri: item.image }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name ?? 'Không rõ tên'}</Text>
                <Text style={styles.detail}>Số lượng: {item.quantity ?? 0}</Text>
                <Text style={styles.price}>{formatPrice(item.price ?? 0)}</Text>
              </View>
            </View>
          ) : null
        )}
        <Text style={[styles.orderInfo, { color: status === 'cancelled' ? 'red' : '#28a745', fontWeight: 'bold' }]}>Trạng thái đơn hàng: {status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}</Text>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Tổng số lượng: {totalQuantity}</Text>
          <Text style={styles.totalText}>Tổng tiền: {formatPrice(totalPrice)}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
          <Text style={styles.buttonText}>Về trang chủ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  customerBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  customerTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#007bff',
  },
  customerInfo: {
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  orderInfo: {
    fontSize: 15,
    marginBottom: 4,
    paddingHorizontal: 20,
    color: '#444',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
  price: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  summaryBox: {
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginTop: 20,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
