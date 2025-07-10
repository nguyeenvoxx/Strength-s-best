import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';

export default function OrderSummaryScreen() {
  const router = useRouter();
  const { selected, id, total, date, voucher } = useLocalSearchParams();
  const orderItems = selected ? JSON.parse(selected as string) : [];

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const totalQuantity = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const totalPrice = orderItems.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);

  return (

    <View style={styles.container}>
      <Text style={styles.header}>Xem đơn hàng</Text>
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
