import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { getUserOrders, Order } from '../services/orderApi';
import { API_CONFIG } from '../constants/config';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, token } = useAuthStore();
  const userId = user?._id || (user as any)?.id;
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userOrders = await getUserOrders(token);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token, userId]);

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
  const handleCancel = async (orderId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn hủy đơn này?', [
      { text: 'Không' },
      {
        text: 'Có',
        onPress: async () => {
          try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/cancel`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });

            if (response.ok) {
              Alert.alert('Thành công', 'Đơn hàng đã được hủy');
              // Refresh danh sách đơn hàng
              if (token) {
                const userOrders = await getUserOrders(token);
                setOrders(userOrders);
              }
            } else {
              const errorData = await response.json();
              Alert.alert('Lỗi', errorData.message || 'Không thể hủy đơn hàng');
            }
          } catch (error) {
            console.error('Error canceling order:', error);
            Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Đơn hàng đã mua</Text>

      {orders.map((order) => (
        <View key={order._id} style={styles.card}>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderDate}>Ngày: {safeDate(order.createdAt)}</Text>
              <Text style={styles.orderId}>Mã đơn: <Text style={{ fontWeight: 'bold' }}>{order._id}</Text></Text>
              
              {/* Hiển thị tên sản phẩm đầu tiên và số lượng */}
              {order.items && order.items.length > 0 && (
                <Text style={{ fontSize: 14, marginTop: 4 }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {(order.items[0].productId as any)?.nameProduct || 'Sản phẩm'}
                  </Text>
                  {order.items.length > 1 && (
                    <Text style={{ color: '#666' }}> và {order.items.length - 1} sản phẩm khác</Text>
                  )}
                </Text>
              )}
              
              <Text style={{ fontSize: 14, marginTop: 4 }}>
                Số lượng: <Text style={{ fontWeight: 'bold' }}>
                  {order.items?.reduce((total, item) => total + item.quantity, 0) ?? 0}
                </Text>
              </Text>
              
              {(order.voucherDiscount || 0) > 0 && (
                <Text style={styles.voucherText}>Giảm giá: {formatPrice(order.voucherDiscount || 0)}</Text>
              )}
              
              <Text style={styles.total}>Tổng thanh toán: {formatPrice(order.totalAmount)}</Text>
              <Text style={styles.paymentMethod}>
                Phương thức: {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
              </Text>
            </View>
            <Text style={{
              color: order.status === 'cancelled' ? 'red' : 
                     order.status === 'delivered' ? '#28a745' : 
                     order.status === 'shipped' ? '#007bff' : '#ffa500',
              fontWeight: 'bold',
              marginBottom: 4,
            }}>
              {order.status === 'cancelled' ? 'Đã hủy' : 
               order.status === 'delivered' ? 'Đã giao' :
               order.status === 'shipped' ? 'Đang giao' :
               order.status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
            </Text>
          </View>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(order._id)}>
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
                  id: order._id,
                  total: order.totalAmount.toString(),
                  date: order.createdAt,
                  voucher: (order.voucherDiscount || 0) > 0 ? `Giảm ${formatPrice(order.voucherDiscount || 0)}` : '',
                  status: order.status,
                  customerName: order.shippingAddress?.fullName ?? '',
                  customerPhone: order.shippingAddress?.phone ?? '',
                  customerAddress: order.shippingAddress?.address ?? '',
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
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default PurchasedOrdersScreen;
