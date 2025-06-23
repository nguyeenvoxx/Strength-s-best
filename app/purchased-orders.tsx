import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const formatPrice = (value: number) => {
  return value.toLocaleString('vi-VN') + ' đ';
};

const PurchasedOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await AsyncStorage.getItem('purchased');
      if (data) setOrders(JSON.parse(data));
    };
    fetchOrders();
  }, []);

  const handleCancel = (orderId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn này?', [
      { text: 'Không' },
      {
        text: 'Có',
        onPress: async () => {
          const updated = orders.filter((o) => o.id !== orderId);
          await AsyncStorage.setItem('purchased', JSON.stringify(updated));
          setOrders(updated);
          Alert.alert('Đã hủy đơn hàng thành công.');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đơn hàng đã mua</Text>

      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={{fontSize:14}}>Sản phẩm: <Text style={{ fontWeight: 'bold', fontSize:13 }}>{order.items[0].name}</Text></Text>
              <Text style={styles.orderId}>Mã đơn: <Text style={{ fontWeight: 'bold' }}>{order.id}</Text></Text>
              <Text style={styles.orderDate}>Ngày: {new Date(order.date).toLocaleDateString('vi-VN')}</Text>
              {order.voucher && (
                <Text style={styles.voucherText}>Mã giảm giá: {order.voucher.code}</Text>
              )}
              <Text>Số lượng: {order.items[0].quantity}</Text>
              <Text style={styles.total}>Tổng thanh toán: {formatPrice(order.total)}</Text>
            </View>
            {order.items?.[0]?.image && (
              <Image
                source={typeof order.items[0].image === 'number' ? order.items[0].image : { uri: order.items[0].image }}
                style={styles.imageRight}
              />
            )}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(order.id)}>
            <Text style={styles.cancelText}>Hủy đơn</Text>
          </TouchableOpacity>
        </View>
      ))}

      {orders.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
          Bạn chưa có đơn hàng nào.
        </Text>
      )}

      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => router.push('/')}
      >
        <Text style={styles.buyButtonText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  voucherText: {
    color: 'green',
    marginBottom: 4,
    fontSize: 14,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  imageRight: {
    width: 89,
    height: 89,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  cancelText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PurchasedOrdersScreen;
