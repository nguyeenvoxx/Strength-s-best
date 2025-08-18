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
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { getUserOrders, Order } from '../services/orderApi';
import { API_CONFIG } from '../constants/config';

// Helper function to get price in VND
const getPriceVND = (price: any) => {
  const n = Number(String(price).replace(/[^0-9.-]+/g, ''));
  return n < 1000 ? n * 1000 : n;
};
// định dạng giá tiền an toàn
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'processing': return 'Đang xử lý';
    case 'shipping': return 'Đang giao';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    default: return 'Chờ xử lý';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return '#ffa500';
    case 'processing': return '#007bff';
    case 'shipping': return '#28a745';
    case 'delivered': return '#28a745';
    case 'cancelled': return '#dc3545';
    default: return '#ffa500';
  }
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
  
  // Review modal states
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = async () => {
      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userOrders = await getUserOrders(token);
        setOrders(userOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        Alert.alert('Thông báo', 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchOrders();
  }, [token, userId]);

  // Revalidate khi quay lại màn purchased orders
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
      return () => {};
    }, [])
  );

  useEffect(() => {
    const loadAddresses = async () => {
      if (!userId) return;
      const savedAddresses = await AsyncStorage.getItem(`userAddresses_${userId}`);
      setAddresses(savedAddresses ? JSON.parse(savedAddresses) : []);
    };
    loadAddresses();
  }, [userId]);

  // Handle review product
  const handleReviewProduct = (product: any, orderId: string) => {
    setSelectedProduct(product);
    setSelectedOrderId(orderId);
    setRating(5);
    setReviewText('');
    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (!selectedProduct || !token) return;

    try {
      setSubmittingReview(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idProduct: selectedProduct._id,
          idOrderDetail: selectedOrderId,
          rating: rating,
          review: reviewText.trim() || undefined
        })
      });

      if (response.ok) {
        Alert.alert('Thành công', 'Đánh giá của bạn đã được gửi!');
        setReviewModalVisible(false);
        // Refresh orders to update review status
        const userOrders = await getUserOrders(token);
        setOrders(userOrders);
      } else {
        const errorData = await response.json();
        Alert.alert('Lỗi', errorData.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      const errorData = error.response?.data || error;
      Alert.alert('Thông báo', errorData.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStarRating = () => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#FFD700' : '#DDD'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
          } catch (error: any) {
            const errorData = error.response?.data || error;
            Alert.alert('Thông báo', errorData.message || 'Không thể hủy đơn hàng');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng đã mua</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.emptyText}>Đang tải...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order?._id || 'unknown'} style={styles.card}>
              <View style={styles.orderHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderDate}>Ngày: {safeDate(order.createdAt || order.created_at || '')}</Text>
                  <Text style={styles.orderId}>Mã đơn: <Text style={{ fontWeight: 'bold' }}>{order?._id}</Text></Text>
                  
                  {/* Hiển thị tên sản phẩm đầu tiên và số lượng */}
                  {order?.items && order.items.length > 0 && (
                    <Text style={{ fontSize: 14, marginTop: 4 }}>
                      <Text style={{ fontWeight: 'bold' }}>
                        {(order.items[0]?.productId || order.items[0]?.idProduct)?.nameProduct || 'Sản phẩm'}
                      </Text>
                      {order.items.length > 1 && ` +${order.items.length - 1} sản phẩm khác`}
                    </Text>
                  )}
                  
                  {/* Hiển thị tổng số lượng */}
                  <Text style={{ fontSize: 12, marginTop: 2, color: '#666' }}>
                    Tổng số lượng: {order.totalQuantity || order.items?.length || 0} sản phẩm
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  <Text style={[styles.statusText, { color: getStatusColor(order?.status || 'pending') }]}>
                    {getStatusText(order?.status || 'pending')}
                  </Text>
                  <Text style={styles.orderTotal}>
                    {formatPrice(order?.totalAmount || order?.totalPrice || 0)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.orderActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => router.replace({
          pathname: '/order-detail/[id]',
          params: { id: order?._id }
        })}
                >
                  <Text style={styles.viewButtonText}>Xem đơn hàng</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  orderStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  orderActions: {
    marginTop: 12,
  },
  viewButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  // Review styles
  reviewSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  reviewButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  reviewButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  productInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PurchasedOrdersScreen;
