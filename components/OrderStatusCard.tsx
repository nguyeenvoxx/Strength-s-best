import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrderStatusCardProps {
  orderStatus: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'success' | 'failed' | 'cancelled';
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  orderStatus,
  paymentStatus,
  orderNumber,
  orderDate,
  totalAmount,
  paymentMethod
}) => {
  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Chờ xử lý', icon: 'time-outline' },
      { key: 'processing', label: 'Đang xử lý', icon: 'construct-outline' },
      { key: 'shipped', label: 'Đã gửi hàng', icon: 'car-outline' },
      { key: 'completed', label: 'Hoàn thành', icon: 'checkmark-circle-outline' }
    ];

    const currentIndex = steps.findIndex(step => step.key === orderStatus);
    
    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'success':
        return '#34C759';
      case 'failed':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'success':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      case 'cancelled':
        return 'Đã hủy thanh toán';
      default:
        return 'Không xác định';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'vnpay':
        return 'VNPay';
      case 'momo':
        return 'MoMo';
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      default:
        return 'Không xác định';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const steps = getStatusSteps();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderNumber}>#{orderNumber}</Text>
        <Text style={styles.orderDate}>
          {new Date(orderDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <View style={styles.paymentInfo}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.paymentValue}>{getPaymentMethodText(paymentMethod)}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Trạng thái thanh toán:</Text>
          <View style={[styles.paymentStatusBadge, { backgroundColor: getPaymentStatusColor(paymentStatus) }]}>
            <Text style={styles.paymentStatusText}>{getPaymentStatusText(paymentStatus)}</Text>
          </View>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Tổng tiền:</Text>
          <Text style={styles.paymentValue}>{formatPrice(totalAmount)}</Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Trạng thái đơn hàng</Text>
        
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.key} style={styles.stepContainer}>
              <View style={styles.stepIconContainer}>
                <Ionicons
                  name={step.icon as any}
                  size={24}
                  color={step.isActive ? '#007AFF' : '#C7C7CC'}
                />
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    { backgroundColor: step.isActive ? '#007AFF' : '#E5E5EA' }
                  ]} />
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                { color: step.isActive ? '#007AFF' : '#8E8E93' }
              ]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  paymentInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLine: {
    width: 2,
    height: 20,
    marginTop: 4,
  },
  stepLabel: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OrderStatusCard; 