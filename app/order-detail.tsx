import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OrderStatusCard from '../components/OrderStatusCard';
import ReviewModal from '../components/ReviewModal';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { API_CONFIG } from '../constants/config';
import { getProductImageUrl, formatPrice } from '../utils/productUtils';
import { getOrderDetail } from '../services/orderApi';
import { getUserReviews } from '../services/reviewApi';

interface OrderItem {
  _id: string;
  nameProduct: string;
  priceProduct: number;
  quantity: number;
  image: string;
}

interface OrderDetail {
  _id: string;
  userId?: string;
  totalAmount: number;
  totalPrice?: number; // Backend có thể trả về totalPrice
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus?: 'pending' | 'success' | 'failed' | 'cancelled';
  voucherDiscount?: number;
  items: {
    productId: any;
    quantity: number;
    price: number;
    name?: string; // Backend có thể trả về name
    image?: string; // Backend có thể trả về image
  }[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
    city?: string;
    fullName?: string;
  };
  createdAt: string;
  updatedAt: string;
  created_at?: string; // Backend có thể trả về created_at
  updated_at?: string; // Backend có thể trả về updated_at
  paidAt?: string;
  totalQuantity?: number;
  payment?: any;
}

const OrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { orderId } = params;
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  

  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrderDetailId, setSelectedOrderDetailId] = useState<string>('');

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  useEffect(() => {
    if (token && order?.status === 'delivered') {
      loadUserReviews();
    }
  }, [token, order?.status]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      
      if (!token || !orderId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng');
        router.back();
        return;
      }

      const orderData = await getOrderDetail(token, orderId as string);
      

      
      const mappedOrder = {
        _id: orderData._id,
        status: orderData.status || 'pending',
        paymentStatus: orderData.paymentStatus || 'pending',
        totalAmount: orderData.totalAmount || orderData.totalPrice || 0,
        totalQuantity: orderData.totalQuantity || 0,
        createdAt: orderData.createdAt || orderData.created_at,
        updatedAt: orderData.updatedAt || orderData.updated_at,
        paidAt: orderData.paidAt,
        paymentMethod: orderData.paymentMethod,
        items: orderData.items || [],
        shippingAddress: orderData.shippingAddress || {
          name: orderData.fullName || '',
          phone: orderData.phone || '',
          address: orderData.address || '',
          fullName: orderData.fullName || ''
        },
        payment: orderData.payment || null
      };
      

      
      setOrder(mappedOrder);
    } catch (error: any) {
      console.error('❌ Error loading order detail:', error);
      console.error('❌ Error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace'
      });
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadUserReviews = async () => {
    try {
      const result = await getUserReviews(token!, 1, 100);
      setUserReviews(result.reviews);
    } catch (error: any) {
      console.error('Error loading user reviews:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có', 
          style: 'destructive',
          onPress: () => {
            // Xử lý hủy đơn hàng
            console.log('Cancelling order:', orderId);
            Alert.alert('Thành công', 'Đơn hàng đã được hủy');
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Liên hệ hỗ trợ',
      'Vui lòng gọi hotline: 1900-xxxx hoặc email: support@strengthbest.com',
      [{ text: 'OK' }]
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Không tìm thấy đơn hàng</Text>
        <Text style={styles.errorSubtitle}>
          Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'processing': return '#007bff';
      case 'shipped': return '#17a2b8';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  console.log('🔍 Rendering order detail with order:', {
    hasOrder: !!order,
    orderId: order?._id,
    status: order?.status,
    totalAmount: order?.totalAmount,
    itemsCount: order?.items?.length || 0
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/purchased-orders')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Order Status */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trạng thái đơn hàng</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
          <Text style={[styles.orderInfo, { color: colors.textSecondary }]}>
            Mã đơn hàng: {order._id}
          </Text>
          <Text style={[styles.orderInfo, { color: colors.textSecondary }]}>
            Ngày đặt: {formatDate(order.createdAt || order.created_at || '')}
          </Text>
          {order.paidAt && (
            <Text style={[styles.orderInfo, { color: colors.textSecondary }]}>
              Ngày thanh toán: {formatDate(order.paidAt)}
            </Text>
          )}
          <Text style={[styles.orderInfo, { color: colors.textSecondary }]}>
            Tổng số lượng: {order.totalQuantity || 0} sản phẩm
          </Text>
          <Text style={[styles.orderInfo, { color: colors.textSecondary }]}>
            Phương thức thanh toán: {order.paymentMethod === 'card' ? 'Thẻ tín dụng' : order.paymentMethod || 'Chưa chọn'}
          </Text>
          <Text style={[styles.orderInfo, { color: colors.textSecondary }]}> 
            Trạng thái thanh toán: {
              (() => {
                const status = (order.payment?.status as string) || (order.paymentStatus as string) || 'pending';
                if (status === 'success' || status === 'completed') return 'Đã thanh toán';
                if (status === 'failed') return 'Thanh toán thất bại';
                if (status === 'cancelled') return 'Đã hủy';
                return 'Chờ thanh toán';
              })()
            }
          </Text>
          {order.payment && (
            <Text style={[styles.orderInfo, { color: colors.textSecondary }]}>
              Mã giao dịch: {order.payment.transactionId}
            </Text>
          )}
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sản phẩm đã đặt</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
            const product = item.productId;
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            const orderDetailId = (item as any)._id || `${order._id}_${index}`;
            const productId = product?._id || item.productId;
            const hasReviewed = hasUserReviewed(productId, orderDetailId);
            
            return (
              <View key={index} style={[styles.itemCard, { borderBottomColor: colors.border }]}>
                <Image
                  source={{ uri: getProductImageUrl(product?.image || item?.image) }}
                  style={styles.itemImage}
                  defaultSource={require('../assets/images_sp/dau_ca_omega.png')}
                />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item?.name || product?.nameProduct || 'Sản phẩm'}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                    {formatPrice(item.price || 0)} x {item.quantity || 0}
                  </Text>
                  <Text style={[styles.itemTotal, { color: colors.accent }]}>
                    {formatPrice(itemTotal)}
                  </Text>
                  
                  {/* Review Button for delivered orders */}
                  {order.status === 'delivered' && (
                    <View style={styles.reviewContainer}>
                      {hasReviewed ? (
                        <View style={styles.reviewedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                          <Text style={[styles.reviewedText, { color: '#28a745' }]}>
                            Đã đánh giá
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.reviewButton, { backgroundColor: colors.accent }]}
                          onPress={() => handleReviewProduct(product, orderDetailId)}
                        >
                          <Ionicons name="star-outline" size={16} color="#fff" />
                          <Text style={styles.reviewButtonText}>
                            Đánh giá sản phẩm
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })
          ) : (
            <Text style={[styles.itemName, { color: colors.textSecondary, textAlign: 'center', padding: 20 }]}>
              Không có thông tin sản phẩm
            </Text>
          )}
        </View>

        {/* Shipping Information */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin giao hàng</Text>
          <View style={styles.shippingCard}>
            <View style={styles.shippingRow}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.shippingText, { color: colors.text }]}>{order.shippingAddress.name || order.shippingAddress.fullName}</Text>
            </View>
            <View style={styles.shippingRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.shippingText, { color: colors.text }]}>{order.shippingAddress.phone}</Text>
            </View>
            <View style={styles.shippingRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.shippingText, { color: colors.text }]}>
                {order.shippingAddress.address}
                {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryCard}>
            {(() => {
              const subtotal = order.items && order.items.length > 0 
                ? order.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
                : 0;
              const discount = order.voucherDiscount || 0;
              return (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tạm tính:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(subtotal)}</Text>
                  </View>
                  {discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Giảm giá:</Text>
                      <Text style={[styles.summaryValue, { color: '#28a745' }]}>-{formatPrice(discount)}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Phí vận chuyển:</Text>
                    <Text style={[styles.summaryValue, { color: colors.text }]}>Miễn phí</Text>
                  </View>
                  <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabelTotal, { color: colors.text }]}>Tổng cộng:</Text>
                    <Text style={[styles.summaryValueTotal, { color: colors.accent }]}>{formatPrice(order?.totalAmount || order?.totalPrice || 0)}</Text>
                  </View>
                </>
              );
            })()}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            <Text style={styles.supportButtonText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  orderInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  shippingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionContainer: {
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  supportButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewContainer: {
    marginTop: 8,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewedText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default OrderDetailScreen; 