import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';

const paymentMethods = [
  { id: 'bank', icon: require('../assets/images/Bank_icon.png'), last4: '2109', name: 'Ngân hàng' },
  { id: 'cash', icon: require('../assets/images/Money_icon.png'), last4: '2109', name: 'Tiền mặt' },
  { id: 'mastercard', icon: require('../assets/images/mastercard_icon.png'), last4: '2109', name: 'Mastercard' },
  { id: 'apple', icon: require('../assets/images/IOS-Bank_icon.png'), last4: '2109', name: 'Apple Pay' },
];

const OrderSummaryScreen: React.FC = () => {
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>('bank');
  const router = useRouter();

  const handleContinue = () => {
    if (selectedMethodId === 'bank') {
      router.push('./qr-payment');
    } else {
      router.push('./payment-success');
    }
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tổng quan đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Đặt hàng:</Text>
            <Text style={styles.value}>2.800.000 VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vận chuyển:</Text>
            <Text style={styles.value}>30.000 VND</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>2.830.000 VND</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodBox,
                selectedMethodId === method.id && styles.methodBoxSelected,
              ]}
              onPress={() => setSelectedMethodId(method.id)}
            >
              <View style={styles.methodContent}>
                <Image source={method.icon} style={styles.methodIcon} />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDetails}>•••• {method.last4}</Text>
                </View>
              </View>
              {selectedMethodId === method.id && (
                <Ionicons name="checkmark-circle" size={20} color="#007bff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.deliverySection}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={20} color="#007bff" />
            <View style={styles.deliveryText}>
              <Text style={styles.deliveryAddress}>123 Đường ABC, Quận 1</Text>
              <Text style={styles.deliveryTime}>Giao hàng trong 2-3 ngày</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, !selectedMethodId && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={!selectedMethodId}
        >
          <Text style={styles.continueButtonText}>Tiếp Tục Thanh Toán</Text>
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
    justifyContent: 'space-between',
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
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  methodBoxSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    resizeMode: 'contain',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  methodDetails: {
    fontSize: 14,
    color: '#666',
  },
  deliverySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryText: {
    marginLeft: 10,
    flex: 1,
  },
  deliveryAddress: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
  bottomContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  continueButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderSummaryScreen;
