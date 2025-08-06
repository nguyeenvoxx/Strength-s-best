import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useVoucherStore } from '../store/useVoucherStore';
import { formatPrice, getProductImageUrl } from '../utils/productUtils';
import { useTheme } from '../store/ThemeContext';
import { createOrder, CreateOrderRequest } from '../services/orderApi';
import AddressSelector from '../components/AddressSelector';
import { Address } from '../services/addressApi';
import { Card, getUserCards, deleteCard, setDefaultCard } from '../services/cardApi';
import { API_CONFIG } from '../constants/config';

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#5CB85C',
    border: '#404040'
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#469B43',
    border: '#e0e0e0'
  };

  const { cart, items, loading, fetchCart, clearCart } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();
  const { vouchers, selectedVoucher, fetchVouchers, selectVoucher } = useVoucherStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCardManagementModal, setShowCardManagementModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartData();
      fetchVouchers(token);
      loadUserCards();
    }
  }, [isAuthenticated, token]);

  const loadCartData = async () => {
    try {
      await fetchCart(token!);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadUserCards = async () => {
    if (!token) return;
    
    try {
      setLoadingCards(true);
      const cards = await getUserCards(token);
      setUserCards(cards);
      
      // Tự động chọn thẻ default nếu có
      const defaultCard = cards.find(card => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard);
      }
    } catch (error) {
      console.error('Error loading user cards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  const calculateSubtotal = () => {
    return (items || []).reduce((total, item) => {
      const product = item.productId as any;
      const originalPrice = product?.priceProduct || 0;
      const discountPercent = product?.discount || 0;
      const finalPrice = originalPrice * (1 - discountPercent / 100);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    let total = calculateSubtotal();
    if (selectedVoucher) {
      total = total * (1 - selectedVoucher.discount / 100);
    }
    return total;
  };

  const calculateDiscount = () => {
    if (!selectedVoucher) return 0;
    return calculateSubtotal() * (selectedVoucher.discount / 100);
  };

  const handleVoucherSelect = (voucher: any) => {
    selectVoucher(voucher);
    setShowVoucherModal(false);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
    
    // Nếu chọn thẻ tín dụng, hiển thị modal chọn thẻ
    if (method === 'card') {
      setShowCardModal(true);
    }
  };

  const handleCardSelect = (card: any) => {
    setSelectedCard(card);
    setShowCardModal(false);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!token) return;
    
    Alert.alert(
      'Xác nhận xóa thẻ',
      'Bạn có chắc chắn muốn xóa thẻ này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(token, cardId);
              
              // Reload danh sách thẻ
              await loadUserCards();
              
              // Nếu thẻ bị xóa là thẻ đang chọn, reset selection
              if (selectedCard?._id === cardId) {
                setSelectedCard(null);
              }
              
              Alert.alert('Thành công', 'Đã xóa thẻ thành công');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Lỗi', 'Không thể xóa thẻ. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const handlePayment = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      return;
    }

    setIsProcessing(true);
    try {
      // Tạo đơn hàng
      const orderItems = (items || []).map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: (item.productId.priceProduct * (1 - (item.productId.discount || 0) / 100))
      }));

      if (!selectedAddress) {
        Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng');
        setIsProcessing(false);
        return;
      }

      // Kiểm tra thông tin địa chỉ
      if (!selectedAddress.name || !selectedAddress.phone || !selectedAddress.address) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin địa chỉ giao hàng (tên, số điện thoại, địa chỉ)');
        setIsProcessing(false);
        return;
      }

      // Kiểm tra định dạng số điện thoại
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(selectedAddress.phone)) {
        Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số');
        setIsProcessing(false);
        return;
      }

      // Kiểm tra nếu thanh toán bằng thẻ thì phải có thẻ được chọn
      if (selectedPaymentMethod === 'card') {
        if (userCards.length === 0) {
          Alert.alert(
            'Chưa có thẻ thanh toán', 
            'Bạn cần thêm ít nhất một thẻ để thanh toán online. Vui lòng thêm thẻ mới.',
            [
              { text: 'Hủy', style: 'cancel' },
              { 
                text: 'Thêm thẻ', 
                onPress: () => router.push('/add-card' as any) 
              }
            ]
          );
          setIsProcessing(false);
          return;
        }
        
        if (!selectedCard) {
          Alert.alert('Lỗi', 'Vui lòng chọn thẻ thanh toán');
          setIsProcessing(false);
          return;
        }
      }

      const orderData: CreateOrderRequest = {
        items: orderItems,
        totalAmount: calculateTotal(),
        paymentMethod: selectedPaymentMethod,
        voucherId: selectedVoucher?._id,
        voucherDiscount: selectedVoucher ? calculateDiscount() : 0,
        shippingAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          province: selectedAddress.province || '',
          district: selectedAddress.district || '',
          ward: selectedAddress.ward || ''
        }
      };


      const createdOrder = await createOrder(token, orderData);
      

      // Nếu thanh toán bằng thẻ, gửi mã OTP và chuyển đến trang xác minh
      if (selectedPaymentMethod === 'card') {
        try {
          // Gửi mã xác minh thanh toán
          const verifyResponse = await fetch(`${API_CONFIG.BASE_URL}/payments/create-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              orderId: createdOrder._id,
              cardId: selectedCard!._id
            })
          });

          if (verifyResponse.ok) {
            setIsProcessing(false);
            router.push({
              pathname: '/verify-payment' as any,
              params: {
                orderId: createdOrder._id,
                cardId: selectedCard!._id,
                amount: calculateTotal(),
                maskedCardNumber: selectedCard!.cardNumber
              }
            });
            return;
          }
        } catch (error) {
          console.error('Error sending payment verification:', error);
        }
        
        // Fallback: vẫn chuyển đến trang xác minh ngay cả khi gửi OTP thất bại
        setIsProcessing(false);
        router.push({
          pathname: '/verify-payment' as any,
          params: {
            orderId: createdOrder._id,
            cardId: selectedCard!._id,
            amount: calculateTotal(),
            maskedCardNumber: selectedCard!.cardNumber
          }
        });
        return;
      }

      // Xóa giỏ hàng sau khi tạo đơn hàng thành công (COD)
      await clearCart(token);

      setIsProcessing(false);
      Alert.alert(
        'Đặt hàng thành công',
        'Đơn hàng của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/purchased-orders')
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      Alert.alert(
        'Lỗi thanh toán',
        'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'
      );
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const product = item.productId as any;
    const originalPrice = product?.priceProduct || 0;
    const discountPercent = product?.discount || 0;
    const finalPrice = originalPrice * (1 - discountPercent / 100);
    
    return (
      <View style={[styles.orderItem, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: getProductImageUrl(product?.image) }}
          style={styles.productImage}
          resizeMode="cover"
          defaultSource={require('../assets/images_sp/dau_ca_omega.png')}
                      onError={(error) => {
              // Image load error handled silently
            }}
            onLoad={() => {
              // Image loaded successfully
            }}
        />
        
        <View style={styles.itemDetails}>
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
            {product?.nameProduct || 'Sản phẩm'}
          </Text>
          
          <View style={styles.priceContainer}>
            {discountPercent > 0 ? (
              <>
                <Text style={[styles.itemPrice, { color: colors.accent }]}>
                  {formatPrice(finalPrice)}
                </Text>
                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  {formatPrice(originalPrice)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercent}%</Text>
                </View>
              </>
            ) : (
              <Text style={[styles.itemPrice, { color: colors.accent }]}>
                {formatPrice(originalPrice)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={[styles.quantityText, { color: colors.text }]}>
            x{item.quantity}
          </Text>
        </View>

        <View style={styles.itemTotal}>
          <Text style={[styles.totalText, { color: colors.accent }]}>
            {formatPrice(finalPrice * item.quantity)}
          </Text>
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loginPrompt, { backgroundColor: colors.card }]}>
          <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.loginTitle, { color: colors.text }]}>
            Đăng nhập để thanh toán
          </Text>
          <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>
            Vui lòng đăng nhập để tiếp tục thanh toán
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải thông tin đơn hàng...
          </Text>
        </View>
      </View>
    );
  }

  if (!items || items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyCart, { backgroundColor: colors.card }]}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Giỏ hàng trống
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/(tabs)/home' as any)}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sản phẩm đặt hàng ({items.length})
          </Text>
          <FlatList
            data={items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Voucher Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mã giảm giá
            </Text>
            <TouchableOpacity onPress={() => setShowVoucherModal(true)}>
              <Text style={[styles.selectText, { color: colors.accent }]}>
                {selectedVoucher ? 'Thay đổi' : 'Chọn mã'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedVoucher ? (
            <View style={styles.selectedVoucher}>
              <Text style={[styles.voucherCode, { color: colors.text }]}>
                {selectedVoucher.code}
              </Text>
              <Text style={[styles.voucherDiscount, { color: colors.accent }]}>
                -{selectedVoucher.discount}%
              </Text>
            </View>
          ) : (
            <Text style={[styles.noVoucherText, { color: colors.textSecondary }]}>
              Chưa có mã giảm giá
            </Text>
          )}
        </View>

        {/* Address Section */}
        <AddressSelector
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
        />

        {/* Payment Method Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Hình thức thanh toán
            </Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(true)}>
              <Text style={[styles.selectText, { color: colors.accent }]}>
                Thay đổi
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectedPayment}>
            <Ionicons 
              name={selectedPaymentMethod === 'cod' ? 'cash-outline' : 'card-outline'} 
              size={24} 
              color={colors.text} 
            />
            <Text style={[styles.paymentMethodText, { color: colors.text }]}>
              {selectedPaymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán bằng thẻ'}
            </Text>
          </View>
        </View>

        {/* Card Information - Only show when card payment is selected */}
        {selectedPaymentMethod === 'card' && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Thông tin thẻ
              </Text>
              <TouchableOpacity onPress={() => setShowCardManagementModal(true)}>
                <Text style={[styles.selectText, { color: colors.accent }]}>
                  Quản lý thẻ
                </Text>
              </TouchableOpacity>
            </View>
            
            {selectedCard ? (
              <View style={styles.selectedCard}>
                <View style={styles.cardInfo}>
                  <Ionicons name="card" size={24} color={colors.accent} />
                  <View style={styles.cardDetails}>
                    <Text style={[styles.cardNumber, { color: colors.text }]}>
                      {selectedCard.maskedCardNumber}
                    </Text>
                    <Text style={[styles.cardHolder, { color: colors.textSecondary }]}>
                      {selectedCard.cardHolder}
                    </Text>
                  </View>
                  <Text style={[styles.cardType, { color: colors.accent }]}>
                    {selectedCard.cardType.toUpperCase()}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noCardSelected}>
                <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.noCardText, { color: colors.textSecondary }]}>
                  Chưa chọn thẻ thanh toán
                </Text>
                <TouchableOpacity 
                  style={[styles.addCardButton, { backgroundColor: colors.accent }]}
                  onPress={() => router.push('/add-card' as any)}
                >
                  <Text style={styles.addCardButtonText}>Thêm thẻ mới</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tổng đơn hàng
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Tạm tính
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(calculateSubtotal())}
            </Text>
          </View>

          {selectedVoucher && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Giảm giá
              </Text>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                -{formatPrice(calculateDiscount())}
              </Text>
            </View>
          )}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Tổng cộng
            </Text>
            <Text style={[styles.totalValue, { color: colors.accent }]}>
              {formatPrice(calculateTotal())}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={[styles.paymentContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.paymentButton, { backgroundColor: colors.accent }]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.paymentButtonText}>
                Thanh toán ngay
              </Text>
              <Text style={styles.paymentAmount}>
                {formatPrice(calculateTotal())}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Voucher Modal */}
      <Modal
        visible={showVoucherModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVoucherModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chọn mã giảm giá
              </Text>
              <TouchableOpacity onPress={() => setShowVoucherModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={vouchers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.voucherItem}
                  onPress={() => handleVoucherSelect(item)}
                >
                  <View style={styles.voucherInfo}>
                    <Text style={[styles.voucherCode, { color: colors.text }]}>
                      {item.code}
                    </Text>
                    <Text style={[styles.voucherDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                    <Text style={[styles.voucherExpiry, { color: colors.textSecondary }]}>
                      Hết hạn: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <View style={styles.voucherDiscount1}>
                    <Text style={styles.discountAmount}>
                      -{item.discount}%
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chọn phương thức thanh toán
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.paymentMethodItem}
              onPress={() => handlePaymentMethodSelect('cod')}
            >
              <Ionicons name="cash-outline" size={24} color={colors.text} />
              <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                Thanh toán khi nhận hàng
              </Text>
              {selectedPaymentMethod === 'cod' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.paymentMethodItem}
              onPress={() => handlePaymentMethodSelect('card')}
            >
              <Ionicons name="card-outline" size={24} color={colors.text} />
              <Text style={[styles.paymentMethodText, { color: colors.text }]}>
                Thanh toán bằng thẻ
              </Text>
              {selectedPaymentMethod === 'card' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Card Management Modal */}
      <Modal
        visible={showCardManagementModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCardManagementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Quản lý thẻ thanh toán
              </Text>
              <TouchableOpacity onPress={() => setShowCardManagementModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {loadingCards ? (
              <View style={styles.cardLoadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.cardLoadingText, { color: colors.textSecondary }]}>
                  Đang tải danh sách thẻ...
                </Text>
              </View>
            ) : (
              <>
                {userCards.length > 0 ? (
                  <>
                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                      Chọn thẻ để thanh toán
                    </Text>
                    
                    {userCards.map((card) => (
                      <TouchableOpacity
                        key={card._id}
                        style={[
                          styles.cardItem,
                          selectedCard?._id === card._id && { backgroundColor: colors.accent + '20' }
                        ]}
                        onPress={() => {
                          setSelectedCard(card);
                          setShowCardManagementModal(false);
                        }}
                      >
                        <View style={styles.cardItemInfo}>
                          <Ionicons name="card" size={24} color={colors.accent} />
                          <View style={styles.cardItemDetails}>
                            <Text style={[styles.cardItemNumber, { color: colors.text }]}>
                              {card.maskedCardNumber}
                            </Text>
                            <Text style={[styles.cardItemHolder, { color: colors.textSecondary }]}>
                              {card.cardHolder}
                            </Text>
                          </View>
                          <Text style={[styles.cardItemType, { color: colors.accent }]}>
                            {card.cardType.toUpperCase()}
                          </Text>
                        </View>
                        
                        <View style={styles.cardItemActions}>
                          {card.isDefault && (
                            <View style={[styles.defaultBadge, { backgroundColor: colors.accent }]}>
                              <Text style={styles.defaultBadgeText}>Mặc định</Text>
                            </View>
                          )}
                          {selectedCard?._id === card._id && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                          )}
                          
                          <TouchableOpacity
                            style={styles.cardActionButton}
                            onPress={() => handleDeleteCard(card._id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#ff4444" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                ) : (
                  <View style={styles.emptyCards}>
                    <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyCardsText, { color: colors.textSecondary }]}>
                      Chưa có thẻ thanh toán nào
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={[styles.addNewCardButton, { backgroundColor: colors.accent }]}
                  onPress={() => {
                    setShowCardManagementModal(false);
                    router.push('/add-card' as any);
                  }}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addNewCardButtonText}>Thêm thẻ mới</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quantityContainer: {
    marginHorizontal: 12,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentContainer: {
    position: 'absolute',
    bottom: 70, // Trên bottom tabs
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  paymentButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  paymentAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedVoucher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  voucherCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  voucherDiscount: {
    fontSize: 14,
    fontWeight: '600',
  },
  noVoucherText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  selectedPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  voucherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode1: {
    fontSize: 16,
    fontWeight: '600',
  },
  voucherDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  voucherExpiry: {
    fontSize: 12,
    marginTop: 2,
  },
  voucherDiscount1: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Card Information Styles
  selectedCard: {
    marginTop: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: 14,
  },
  cardType: {
    fontSize: 12,
    fontWeight: '600',
  },
  noCardSelected: {
    alignItems: 'center',
    padding: 20,
  },
  noCardText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  addCardButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Card Management Modal Styles
  cardLoadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  cardLoadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  cardItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardItemNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardItemHolder: {
    fontSize: 14,
  },
  cardItemType: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardActionButton: {
    padding: 8,
  },
  emptyCards: {
    alignItems: 'center',
    padding: 40,
  },
  emptyCardsText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  addNewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addNewCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CheckoutScreen;
