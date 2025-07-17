import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const paymentMethods = [
  { id: 'bank', icon: require('../assets/images/Bank_icon.png'), last4: '2109', name: 'Ngân hàng' },
  { id: 'cash', icon: require('../assets/images/Money_icon.png'), last4: '2109', name: 'Tiền mặt' },
  { id: 'mastercard', icon: require('../assets/images/mastercard_icon.png'), last4: '2109', name: 'Mastercard' },
  { id: 'apple', icon: require('../assets/images/IOS-Bank_icon.png'), last4: '2109', name: 'Apple Pay' },
];

const OrderSummaryScreen: React.FC = () => {
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<null | {
    id: string;
    code: string;
    description: string;
    discountPercent: number;
    maxDiscount: number;
    minOrder: number;
  }>(null);

  const vouchers = [
    {
      id: 'v1',
      code: 'GIAM10',
      description: 'Khuyến mãi thân thiện | giảm 10% (tối đa 5.000đ) cho chuyến từ 20.000đ',
      date: '24/11/2025',
      discountPercent: 10,
      maxDiscount: 5000,
      minOrder: 20000,
    },
    {
      id: 'v2',
      code: 'GIAM10',
      description: 'Khuyến mãi thân thiện | giảm 10% (tối đa 5.000đ) cho chuyến từ 20.000đ',
      date: '24/11/2025',
      discountPercent: 10,
      maxDiscount: 5000,
      minOrder: 20000,
    },
    {
      id: 'v3',
      code: 'GIAM10',
      description: 'Khuyến mãi thân thiện | giảm 10% (tối đa 5.000đ) cho chuyến từ 20.000đ',
      date: '24/11/2025',
      discountPercent: 10,
      maxDiscount: 5000,
      minOrder: 20000,
    },
  ];
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>('bank');
  const router = useRouter();

  // truyền du liệu từ giỏ hàng
  const { selected } = useLocalSearchParams();
  const selectedItems = selected ? JSON.parse(selected as string) : [];

  const totalOrder = selectedItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = 30000;
  const totalAmount = totalOrder + shippingFee;
  // Tính toán giảm giá voucher
  const discount =
    selectedVoucher && totalOrder >= selectedVoucher?.minOrder
      ? Math.min(
        (totalOrder * (selectedVoucher?.discountPercent || 0)) / 100,
        selectedVoucher?.maxDiscount || 0
      )
      : 0;
  const finalTotal = totalOrder + shippingFee - discount;
  // Cập nhật tổng tiền sau khi áp dụng voucher
  
  const handleContinue = () => {
   const data = {
  selected: JSON.stringify(selectedItems),
  voucher: selectedVoucher ? JSON.stringify(selectedVoucher) : '',
};

    if (selectedMethodId === 'bank') {
      router.push({ pathname: '/qr-payment', params: data });
    } else {
      router.push({ pathname: '/payment-success', params: data });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.viewGroup}>
          <Image style={styles.iconGroup} source={require('../assets/images/Group_icon.png')} />
          <Text style={styles.tileGroup}>Địa chỉ</Text>
        </View>
        <View style={styles.Address}>
          <View style={styles.addressBox}>
            <TouchableOpacity style={styles.iconEdit}>
              <Image style={styles.EditIcon} source={require('../assets/images/edit_icon.png')} />
            </TouchableOpacity>
            <Text style={styles.tile1}>Địa chỉ:</Text>
            <Text>Hoàng triệu Tâm Nhân</Text>
            <Text>120 Quang Trung, P14, Quận Gò Vấp, TPHCM</Text>
            <Text>SĐT: +84-32842324</Text>
          </View>
        </View>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.orderSummary}>

            {selectedItems.map((item: any) => (
              <View key={item.id || item._id} style={styles.productBox}>
                <Image
                  source={typeof item.image === 'number' ? item.image : { uri: item.image }}
                  style={styles.productImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{item.name}</Text>
                  <Text style={styles.value}>
                    {item.price.toLocaleString()} VND x {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Đặt hàng:</Text>
            <Text style={styles.value}>{totalOrder.toLocaleString()} VND</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vận chuyển:</Text>
            <Text style={styles.value}>{shippingFee.toLocaleString()} VND</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{finalTotal.toLocaleString()} VND</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setVoucherModalVisible(true)} style={styles.voucherButton}>
          <Text style={styles.voucherText}>
            {selectedVoucher ? `Voucher: ${selectedVoucher.code}` : 'Áp dụng mã giảm giá'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={voucherModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn mã giảm giá</Text>

              {vouchers.map((voucher) => (
                <View key={voucher.id} style={styles.voucherCard}>
                  <Text>{voucher.description}</Text>
                  <Text style={styles.voucherDate}>{voucher.date}</Text>

                  <View style={styles.voucherActions}>
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={() => {
                        setSelectedVoucher(voucher);
                        setVoucherModalVisible(false);
                      }}
                    >
                      <Text style={styles.applyText}>Áp dụng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (selectedVoucher?.id === voucher.id) {
                          setSelectedVoucher(null);
                        }
                      }}
                    >
                      <Text style={styles.removeText}>Xoá</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                <Text style={{ color: '#007bff', marginTop: 20, textAlign: 'center' }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  // Styles ma giam gia
  voucherButton: {
  backgroundColor: '#f1f1f1',
  padding: 12,
  borderRadius: 10,
  marginVertical: 10,
},
voucherText: {
  color: '#333',
  textAlign: 'center',
  fontWeight: '500',
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'flex-end',
},
modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  maxHeight: '70%',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 15,
},
voucherCard: {
  backgroundColor: '#f9f9f9',
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
},
voucherDate: {
  marginTop: 6,
  fontSize: 13,
  color: '#777',
},
voucherActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
applyButton: {
  backgroundColor: '#28a745',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
},
applyText: {
  color: '#fff',
  fontWeight: 'bold',
},
removeText: {
  color: 'red',
  fontWeight: '500',
},
//
  tile1: {
    fontSize: 15,
    fontWeight: '500',
  },
  iconEdit: {
    width: 30,
    height: 20,
    position: 'absolute',
    top: 5,
    right: 5,
  },
  EditIcon: {
    width: 20,
    height: 20
  },
  addressBox: {
    flex: 1,
    width: 241,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  Address: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 0,
    gap: 15,
    borderRadius: 10,
    marginTop: 12
  },
  tileGroup: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  iconGroup: {
    height: 20,
    width: 17,
    marginEnd: 10,
    marginLeft: 10,
    fontWeight: 100
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'contain',
  },
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
    backgroundColor: '#469B43',
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
