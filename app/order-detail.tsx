import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OrderStatusCard from '../components/OrderStatusCard';

interface OrderItem {
  _id: string;
  nameProduct: string;
  priceProduct: number;
  quantity: number;
  image: string;
}

interface OrderDetail {
  _id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled';
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
  };
}

const OrderDetailScreen: React.FC = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      // Mock data - trong thực tế sẽ gọi API
      const mockOrder: OrderDetail = {
        _id: orderId as string,
        orderNumber: 'ORD001',
        orderDate: new Date().toISOString(),
        totalAmount: 1500000,
        status: 'processing',
        paymentStatus: 'success',
        paymentMethod: 'vnpay',
        items: [
          {
            _id: '1',
            nameProduct: 'Whey Protein',
            priceProduct: 500000,
            quantity: 2,
            image: 'https://via.placeholder.com/100'
          },
          {
            _id: '2',
            nameProduct: 'BCAA',
            priceProduct: 300000,
            quantity: 1,
            image: 'https://via.placeholder.com/100'
          }
        ],
        shippingAddress: {
          name: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '123 Đường ABC, Quận 1, TP.HCM'
        }
      };
      
      setOrder(mockOrder);
    } catch (error) {
      console.error('Error loading order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <OrderStatusCard
          orderStatus={order.status}
          paymentStatus={order.paymentStatus}
          orderNumber={order.orderNumber}
          orderDate={order.orderDate}
          totalAmount={order.totalAmount}
          paymentMethod={order.paymentMethod}
        />

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {order.items.map((item, index) => (
            <View key={item._id} style={styles.itemCard}>
              <View style={styles.itemImageContainer}>
                <View style={styles.itemImage} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.nameProduct}</Text>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.priceProduct)} x {item.quantity}
                </Text>
                <Text style={styles.itemTotal}>
                  {formatPrice(item.priceProduct * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.shippingCard}>
            <View style={styles.shippingRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.shippingText}>{order.shippingAddress.name}</Text>
            </View>
            <View style={styles.shippingRow}>
              <Ionicons name="call-outline" size={20} color="#666" />
              <Text style={styles.shippingText}>{order.shippingAddress.phone}</Text>
            </View>
            <View style={styles.shippingRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.shippingText}>{order.shippingAddress.address}</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.summaryValue}>Miễn phí</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelTotal}>Tổng cộng:</Text>
              <Text style={styles.summaryValueTotal}>{formatPrice(order.totalAmount)}</Text>
            </View>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
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
});

export default OrderDetailScreen; 