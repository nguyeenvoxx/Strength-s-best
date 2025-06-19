import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CheckoutScreen: React.FC = () => {
  const router = useRouter();

  const cartItems = [
    { id: 1, name: 'Vitamin D3 2000IU', price: 250000, quantity: 2 },
    { id: 2, name: 'Omega-3 Fish Oil', price: 300000, quantity: 1 },
  ];

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };
  const handlePayment = () => {
    router.push('./order-summary');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color="#007bff" />
              <Text style={styles.addressName}>Nguyễn Văn A</Text>
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Mặc định</Text>
              </View>
            </View>
            <Text style={styles.addressText}>
              123 Đường ABC, Phường XYZ, Quận 1, TP.HCM
            </Text>
            <Text style={styles.phoneText}>+84 123 456 789</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã chọn</Text>
          {cartItems.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.productImage}>
                <Ionicons name="medical" size={24} color="#007bff" />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity style={styles.paymentMethod}>
            <Ionicons name="card" size={20} color="#007bff" />
            <Text style={styles.paymentText}>Thẻ tín dụng/ghi nợ</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentMethod}>
            <Ionicons name="wallet" size={20} color="#007bff" />
            <Text style={styles.paymentText}>Ví điện tử</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentMethod}>
            <Ionicons name="cash" size={20} color="#007bff" />
            <Text style={styles.paymentText}>Thanh toán khi nhận hàng</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Promotion Code */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.promoSection}>
            <Ionicons name="pricetag" size={20} color="#007bff" />
            <Text style={styles.promoText}>Mã giảm giá</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính:</Text>
            <Text style={styles.summaryValue}>{formatPrice(getTotalPrice())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
            <Text style={styles.summaryValue}>Miễn phí</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={styles.summaryValue}>-0đ</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatPrice(getTotalPrice())}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Payment Button */}
      <View style={styles.bottomSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Tổng thanh toán</Text>
          <Text style={styles.totalAmount}>{formatPrice(getTotalPrice())}</Text>
        </View>
        <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
          <Text style={styles.paymentButtonText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#666',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  promoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  promoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  bottomSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalText: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  paymentButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;
