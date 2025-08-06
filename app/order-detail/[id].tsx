import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getOrderDetailById, OrderDetail, cancelOrder } from '../../services/orderDetailApi';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';
import ReviewModal from '../../components/ReviewModal';
import { getUserReviews } from '../../services/reviewApi';

interface OrderDetailItem {
  _id: string;
  productId: any;
  quantity: number;
  price: number;
  total: number;
  name: string;
}

const OrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? DarkColors : LightColors;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrderDetailId, setSelectedOrderDetailId] = useState<string>('');

  useEffect(() => {
    if (orderId && token) {
      loadOrderDetail();
    }
  }, [orderId, token]);

  useEffect(() => {
    if (order?.status === 'delivered') {
      loadUserReviews();
    }
  }, [order?.status]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderDetailById(token!, orderId);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Error loading order detail:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết đơn hàng');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async () => {
    try {
      const reviews = await getUserReviews(token!);
      setUserReviews(reviews.reviews || []);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrderDetail();
    setRefreshing(false);
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(token!, orderId);
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
              loadOrderDetail(); // Reload để cập nhật trạng thái
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy đơn hàng');
            }
          }
        }
      ]
    );
  };

  const handleReviewProduct = (product: any, orderDetailId: string) => {
    setSelectedProduct(product);
    setSelectedOrderDetailId(orderDetailId);
    setReviewModalVisible(true);
  };

  const handleReviewSubmitted = () => {
    loadUserReviews();
  };

  const hasUserReviewed = (productId: string, orderDetailId: string) => {
    return userReviews.some(review => 
      review.idProduct === productId && review.idOrderDetail === orderDetailId
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: '#FFA500',
      processing: '#007AFF',
      shipped: '#FF6B35',
      delivered: '#28A745',
      cancelled: '#DC3545'
    };
    return colorMap[status] || '#666';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Đang tải chi tiết đơn hàng...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Không tìm thấy đơn hàng
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={loadOrderDetail}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Chi tiết đơn hàng
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Order Status */}
        <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
              Trạng thái:
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
          <Text style={[styles.orderId, { color: colors.textSecondary }]}>
            Mã đơn hàng: {order._id}
          </Text>
        </View>

        {/* Order Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin đơn hàng
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Ngày đặt:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatDate(order.createdAt)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Phương thức thanh toán:
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {order.paymentMethod === 'card' ? 'Thẻ tín dụng' : order.paymentMethod}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Tổng tiền:
            </Text>
            <Text style={[styles.totalAmount, { color: colors.accent }]}>
              {formatPrice(order.totalAmount)}
            </Text>
          </View>
          {order.payment?.paidAt && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Ngày thanh toán:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(order.payment.paidAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Địa chỉ giao hàng
          </Text>
          <View style={styles.addressContainer}>
            <Text style={[styles.addressName, { color: colors.text }]}>
              {order.shippingAddress.fullName}
            </Text>
            <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>
              {order.shippingAddress.phone}
            </Text>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {order.shippingAddress.address}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sản phẩm ({order.items.length})
          </Text>
          {order.items.map((item, index) => (
            <View key={item._id} style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
                  Số lượng: {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>
                  {formatPrice(item.price)} x {item.quantity}
                </Text>
              </View>
              <View style={styles.itemTotal}>
                <Text style={[styles.itemTotalText, { color: colors.accent }]}>
                  {formatPrice(item.total)}
                </Text>
                {order.status === 'delivered' && !hasUserReviewed(item.productId?._id || item.productId, item._id) && (
                  <TouchableOpacity
                    style={[styles.reviewButton, { backgroundColor: colors.accent }]}
                    onPress={() => handleReviewProduct(item.productId, item._id)}
                  >
                    <Text style={styles.reviewButtonText}>Đánh giá</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'delivered' && hasUserReviewed(item.productId?._id || item.productId, item._id) && (
                  <View style={[styles.reviewedBadge, { backgroundColor: colors.success }]}>
                    <Text style={styles.reviewedText}>Đã đánh giá</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        {order.payment && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Thông tin thanh toán
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Trạng thái:
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {order.payment.status === 'completed' ? 'Đã thanh toán' : order.payment.status}
              </Text>
            </View>
            {order.payment.transactionId && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Mã giao dịch:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {order.payment.transactionId}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.error }]}
              onPress={handleCancelOrder}
            >
              <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                Hủy đơn hàng
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      {selectedProduct && (
        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          product={selectedProduct}
          orderDetailId={selectedOrderDetailId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  statusContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 14,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressContainer: {
    marginTop: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reviewedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    margin: 16,
    padding: 16,
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;
