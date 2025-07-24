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
import { useAuthStore } from '../store/useAuthStore';

// Helper function to get price in VND
const getPriceVND = (price: any) => {
  const n = Number(String(price).replace(/[^0-9.-]+/g, ''));
  return n < 1000 ? n * 1000 : n;
};
// định dạng giá tiền an toàn
const formatPrice = (value: number | null | undefined) => {
  if (typeof value !== 'number' || isNaN(value)) return '0 đ';
  return value.toLocaleString('vi-VN') + ' đ';
};
// Helper to safely stringify
const safeString = (val: any) => (val === null || val === undefined ? 'Không rõ' : val.toString());
// Helper to safely format date
const safeDate = (val: any) => {
  if (!val) return 'Không rõ';
  const d = new Date(val);
  return d.toString() === 'Invalid Date' ? 'Không rõ' : d.toLocaleDateString('vi-VN');
};
//khai báo kiểu dữ liệu cho đơn hàng
const PurchasedOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();
  const user = useAuthStore.getState().user;
  const userId = user?._id || (user as any)?.id;
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await AsyncStorage.getItem('purchased');
      if (data) {
        const allOrders = JSON.parse(data);
        const user = useAuthStore.getState().user;
        const userId = user?._id || (user as any)?.id;
        setOrders(allOrders.filter((o: any) => o.userId === userId));
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!userId) return;
      const savedAddresses = await AsyncStorage.getItem(`userAddresses_${userId}`);
      setAddresses(savedAddresses ? JSON.parse(savedAddresses) : []);
    };
    loadAddresses();
  }, [userId]);

  // xử lý hủy đơn hàng
  // hiển thị cảnh báo xác nhận trước khi hủy đơn
  const handleCancel = (orderId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn này?', [
      { text: 'Không' },
      {
        text: 'Có',
        onPress: async () => {
          const updated = orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' } : o
          );
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
              <Text style={{ fontSize: 14 }}>
                Sản phẩm:{' '}
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {order.items?.[0]?.name ?? 'Không rõ'}
                </Text>
              </Text>
              <Text style={styles.orderId}>Mã đơn: <Text style={{ fontWeight: 'bold' }}>{safeString(order.id)}</Text></Text>
              <Text style={styles.orderDate}>Ngày: {safeDate(order.date)}</Text>
              {order.voucher && (
                <Text style={styles.voucherText}>Mã giảm giá: {order.voucher.code}</Text>
              )}
              <Text>Số lượng: {order.items?.[0]?.quantity ?? 0}</Text>
              <Text style={styles.total}>Tổng thanh toán: {formatPrice(order.total)}</Text>
            </View>
            {order.items?.[0]?.image && (
              <Image
                source={typeof order.items[0].image === 'number' ? order.items[0].image : { uri: order.items[0].image }}
                style={styles.imageRight}
              />
            )}
            <Text style={{
              color: order.status === 'cancelled' ? 'red' : '#28a745',
              fontWeight: 'bold',
              marginBottom: 4,
            }}>
              {order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
            </Text>
          </View>
          {order.status !== 'cancelled' && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(order.id)}>
              <Text style={styles.cancelText}>Hủy đơn</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ marginTop: 10, padding: 10, backgroundColor: '#007bff', borderRadius: 6 }}
            onPress={() =>
              router.push({
                pathname: '/order-summary',
                params: {
                  selected: JSON.stringify(order.items),
                  id: safeString(order.id),
                  total: safeString(order.total), // truyền dạng chuỗi an toàn
                  date: order.date,
                  voucher: order.voucher?.code ?? '',
                  status: order.status ?? 'processing',
                  customerName: order.customerName ?? '',
                  customerPhone: order.customerPhone ?? '',
                  customerAddress: order.customerAddress ?? '',
                },
              })
            }
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              Xem đơn hàng
            </Text>
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
        onPress={() => router.push('/(tabs)/home')}
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
