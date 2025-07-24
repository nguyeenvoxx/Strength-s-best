import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/useAuthStore';
import { useVoucherStore } from '../store/useVoucherStore';
import VoucherListModal from './components/VoucherListModal';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

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
  const { vouchers: backendVouchers, fetchVouchers, isLoading: voucherLoading, error: voucherError } = useVoucherStore();
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  useEffect(() => {
    const loadAddress = async () => {
      const userId = user?._id || (user as any)?.id;
      if (!userId) return;
      // Ưu tiên lấy địa chỉ đã chọn gần nhất
      const selected = await AsyncStorage.getItem(`selectedDeliveryAddress_${userId}`);
      if (selected) {
        setSelectedAddress(JSON.parse(selected));
        return;
      }
      // Nếu chưa có, lấy địa chỉ mặc định
      const savedAddresses = await AsyncStorage.getItem(`userAddresses_${userId}`);
      let addresses = savedAddresses ? JSON.parse(savedAddresses) : [];
      if (addresses.length === 0) {
        // Nếu chưa có địa chỉ nào, tạo địa chỉ mặc định cho user này
        const defaultAddress: Address = {
          id: userId,
          name: user?.name || 'Khách hàng',
          phone: user?.phone || (user as any)?.phoneNumber || '',
          address: user?.address || 'Chưa có địa chỉ',
          isDefault: true
        };
        addresses = [defaultAddress];
        await AsyncStorage.setItem(`userAddresses_${userId}`, JSON.stringify(addresses));
      }
      const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
      setSelectedAddress(defaultAddress || null);
    };
    loadAddress();
  }, [user?._id]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>('bank');

  // truyền du liệu từ giỏ hàng hoặc mua ngay
  const { selected } = useLocalSearchParams();
  const [selectedItems, setSelectedItems] = useState<any[]>(selected ? JSON.parse(selected as string) : []);

  useEffect(() => {
    const checkBuyNow = async () => {
      if (!selected && selectedItems.length === 0) {
        const buyNow = await AsyncStorage.getItem('buyNowProduct');
        if (buyNow) {
          const product = JSON.parse(buyNow);
          setSelectedItems([{ 
            ...product, 
            quantity: 1, 
            name: product.name || product.nameProduct || product.title // Đảm bảo có trường name
          }]);
          await AsyncStorage.removeItem('buyNowProduct');
        }
      }
    };
    checkBuyNow();
  }, []);

  // Helper function to get price in VND
  const getPriceVND = (price: any) => {
    const n = Number(String(price).replace(/[^0-9.-]+/g, ''));
    return n < 1000 ? n * 1000 : n;
  };
  // Tính tổng tiền sản phẩm (đảm bảo item.price là số và đúng đơn vị VND)
  const totalOrder = selectedItems.reduce(
    (sum: number, item: any) => sum + getPriceVND(item.price) * item.quantity,
    0
  );
  // Phí vận chuyển (nếu backend trả là 30 thì đổi thành 30 * 1000)
  const shippingFee = 30000; // Nếu cần thì đổi thành 30 * 1000
  // Tính toán giảm giá voucher (dùng voucher từ backend)
  const discount =
    selectedVoucher && totalOrder >= (selectedVoucher.minOrder || 0)
      ? Math.min(
          (totalOrder * (selectedVoucher.discountPercent || 0)) / 100,
          selectedVoucher.maxDiscount || 9999999
        )
      : 0;
  const finalTotal = totalOrder + shippingFee - discount;

  // Sử dụng useFocusEffect để refresh địa chỉ khi quay lại màn hình
  useFocusEffect(
    React.useCallback(() => {
      loadSelectedAddress();
    }, [])
  );

  const loadSelectedAddress = async () => {
    try {
      const savedAddress = await AsyncStorage.getItem('selectedDeliveryAddress');
      if (savedAddress) {
        setSelectedAddress(JSON.parse(savedAddress));
      } else {
        // Tạo địa chỉ mặc định từ thông tin user
        const defaultAddress: Address = {
          id: '1',
          name: user?.name || 'Khách hàng',
          phone: user?.phone || '',
          address: user?.address || 'Chưa có địa chỉ',
          isDefault: true
        };
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ:', error);
    }
  };

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

  const handleSelectAddress = () => {
    router.push('/select-address');
  };

  // Khi bấm nút áp dụng mã giảm giá, fetch voucher từ backend và mở modal
  const handleApplyVoucher = async () => {
    await fetchVouchers();
    setVoucherModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.viewGroup}>
          <Image style={styles.iconGroup} source={require('../assets/images/Group_icon.png')} />
          <Text style={styles.tileGroup}>Địa chỉ</Text>
        </View>
        
        {/* Address Selection */}
        <TouchableOpacity style={styles.Address} onPress={handleSelectAddress}>
          <View style={styles.addressBox}>
            <TouchableOpacity style={styles.iconEdit}>
              <Image style={styles.EditIcon} source={require('../assets/images/edit_icon.png')} />
            </TouchableOpacity>
            <Text style={styles.tile1}>Địa chỉ:</Text>
            <Text style={styles.addressName}>{selectedAddress?.name || 'Chưa có địa chỉ'}</Text>
            <Text style={styles.addressText}>{selectedAddress?.address || 'Vui lòng chọn địa chỉ'}</Text>
            <Text style={styles.addressPhone}>SĐT: {selectedAddress?.phone || 'Chưa có số điện thoại'}</Text>
          </View>
        </TouchableOpacity>

        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.orderSummary}>

            {selectedItems.map((item: any) => (
              <View key={item.idProduct?._id || item._id || item.id} style={styles.productBox}>
                <Image
                  source={item.idProduct?.image ? { uri: `${require('../constants/config').API_CONFIG.BASE_URL}/uploads/${item.idProduct.image}` } : (item.image ? (typeof item.image === 'number' ? item.image : { uri: item.image }) : require('../assets/images/logo.png'))}
                  style={styles.productImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{item.idProduct?.nameProduct || item.name || item.title}</Text>
                  {item.idProduct?.description || item.description ? (
                    <Text style={{ color: '#666', marginBottom: 5 }}>
                      {item.idProduct?.description || item.description}
                    </Text>
                  ) : null}
                  <Text style={[styles.value, { color: '#469B43', fontWeight: 'bold' }]}> 
                    {getPriceVND(item.price).toLocaleString('vi-VN')} đ
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '300' }}>
                    Số lượng: {item.quantity}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Đặt hàng:</Text>
            <Text style={styles.value}>{totalOrder.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vận chuyển:</Text>
            <Text style={styles.value}>{shippingFee.toLocaleString('vi-VN')} đ</Text>
          </View>
          {discount > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Giảm giá:</Text>
              <Text style={[styles.value, { color: 'green' }]}>- {discount.toLocaleString('vi-VN')} đ</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{finalTotal.toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleApplyVoucher} style={styles.voucherButton}>
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
            <VoucherListModal
              vouchers={backendVouchers}
              onApply={voucher => {
                const v = voucher as import('../services/api').ApiVoucher;
                setSelectedVoucher({
                  id: v._id,
                  code: v.code,
                  description: v.description,
                  discountPercent: v.discount,
                  maxDiscount: 9999999,
                  minOrder: 0
                });
                setVoucherModalVisible(false);
              }}
              onDelete={voucherId => {
                // Xử lý xoá voucher nếu cần
              }}
              onClose={() => setVoucherModalVisible(false)}
            />
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
              <Text style={styles.deliveryAddress}>
                {selectedAddress?.name ? `${selectedAddress.name} - ${selectedAddress.address}` : 'Chưa có địa chỉ'}
              </Text>
              <Text style={styles.deliveryPhone}>
                {selectedAddress?.phone ? `SĐT: ${selectedAddress.phone}` : 'Chưa có số điện thoại'}
              </Text>
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
  deliveryPhone: {
    fontSize: 14,
    color: '#666',
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
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
  },
});

export default OrderSummaryScreen;
