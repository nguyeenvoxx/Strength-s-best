import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useVoucherStore } from '../store/useVoucherStore';
import { formatPrice, getProductImageUrl } from '../utils/productUtils';
import { STRIPE_CONFIG, API_CONFIG } from '../constants/config';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { useTheme } from '../store/ThemeContext';
import { useNotificationStore } from '../store/useNotificationStore';
import { createOrder, CreateOrderRequest } from '../services/orderApi';
import AddressSelector from '../components/AddressSelector';
import { Address, getUserAddresses } from '../services/addressApi';
import { Card, getUserCards, deleteCard, setDefaultCard } from '../services/cardApi';
import { userVoucherApi, ApiUserVoucher } from '../services/api';
import { useSimpleDataSync } from '../hooks/useSimpleDataSync';
import PullToRefresh from '../components/PullToRefresh';
import UpdateStatusBar from '../components/UpdateStatusBar';
import { useSelectedItemsStore } from '../store/useSelectedItemsStore';

const CheckoutScreen: React.FC = () => {
  const router = useRouter();
  const params = (router as any).params || {};
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
  const { create: createNotification } = useNotificationStore();
  const { selectedItemIds, clearSelectedItems } = useSelectedItemsStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [useSavedCard, setUseSavedCard] = useState(false);

  const [showCardManagementModal, setShowCardManagementModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [userVouchers, setUserVouchers] = useState<ApiUserVoucher[]>([]);
  const [selectedUserVoucher, setSelectedUserVoucher] = useState<ApiUserVoucher | null>(null);
  const [loadingUserVouchers, setLoadingUserVouchers] = useState(false);
  const [shouldRefreshCards, setShouldRefreshCards] = useState(false);
  const [showCardAddedMessage, setShowCardAddedMessage] = useState(false);
  const [cardVerified, setCardVerified] = useState(false);
  const [autoSelectedCard, setAutoSelectedCard] = useState(false);
  const [returnedFromMyCards, setReturnedFromMyCards] = useState(false);

  // Use custom hook for data synchronization
  const {
    data: addresses,
    loading: addressesLoading,
    refresh: refreshAddresses,
    lastUpdated: addressesLastUpdated
  } = useSimpleDataSync(
    async (token: string) => {
      const userAddresses = await getUserAddresses(token);
      return userAddresses;
    },
    {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
      cacheTime: 60000 // 1 minute
    }
  );

  const {
    data: cards,
    loading: cardsLoading,
    refresh: refreshCards,
    lastUpdated: cardsLastUpdated
  } = useSimpleDataSync(
    async (token: string) => {
      const userCards = await getUserCards(token);
      return userCards;
    },
    {
      autoRefresh: true,
      refreshInterval: 60000, // 1 minute
      cacheTime: 120000 // 2 minutes
    }
  );

  const {
    data: userVouchersData,
    loading: userVouchersLoading,
    refresh: refreshUserVouchers,
    lastUpdated: userVouchersLastUpdated
  } = useSimpleDataSync(
    async (token: string) => {
      const response = await userVoucherApi.getUserVouchers();
      return response.data.userVouchers.filter(v => v.status === 'active');
    },
    {
      autoRefresh: true,
      refreshInterval: 45000, // 45 seconds
      cacheTime: 90000 // 1.5 minutes
    }
  );

  // Update local state when data changes
  useEffect(() => {
    if (userVouchersData) {
      setUserVouchers(userVouchersData);
    }
  }, [userVouchersData]);

  // Kiểm tra và cập nhật địa chỉ từ AsyncStorage khi component mount hoặc focus
  useFocusEffect(
    useCallback(() => {
      const checkAndUpdateAddress = async () => {
        try {
          const addressUpdated = await AsyncStorage.getItem('addressUpdated');
          if (addressUpdated === 'true') {
            // Xóa flag để tránh cập nhật lại
            await AsyncStorage.removeItem('addressUpdated');
            
            // Lấy địa chỉ đã chọn từ AsyncStorage
            const savedAddress = await AsyncStorage.getItem('selectedDeliveryAddress');
            if (savedAddress) {
              const address = JSON.parse(savedAddress);
              console.log('📍 Checkout - Updating address from AsyncStorage:', address);
              setSelectedAddress(address);
            }
          }
        } catch (error) {
          console.error('❌ Error checking address update:', error);
        }
      };

      checkAndUpdateAddress();
    }, [])
  );

  // Đồng bộ danh sách thẻ và tự động chọn thẻ hợp lệ khi cần
  useEffect(() => {
    if (!cards) return;
    // đồng bộ danh sách thẻ từ API vào state cục bộ (chỉ khi thật sự thay đổi)
    setUserCards((prev) => {
      const isSame = Array.isArray(prev)
        && prev.length === cards.length
        && prev.every((c, i) => c._id === cards[i]._id && c.isDefault === cards[i].isDefault);
      return isSame ? prev : cards;
    });
    // nếu đang chọn thanh toán bằng thẻ mà chưa có thẻ được chọn thì chọn thẻ mặc định/đầu tiên
    if (selectedPaymentMethod === 'card' && !selectedCard && cards.length > 0) {
      const defaultCard = cards.find(c => c.isDefault) || cards[0];
      setSelectedCard(defaultCard);
    }
  }, [cards, selectedPaymentMethod]);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartData();
      fetchVouchers(token);
    }
  }, [isAuthenticated, token]);

  // Tự động chọn thẻ khi thay đổi phương thức thanh toán
  useEffect(() => {
    if (selectedPaymentMethod === 'card' && !selectedCard && userCards.length > 0) {
      const defaultCard = userCards.find(card => card.isDefault) || userCards[0];
      setSelectedCard(defaultCard);
    }
  }, [selectedPaymentMethod, userCards]);

  // Refresh data when screen comes into focus (chỉ refresh, tránh setState lặp)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && token) {
        refreshCards();
        refreshUserVouchers();
        setShouldRefreshCards(false);
        setCardVerified(false);
        setAutoSelectedCard(false);
      }
    }, [isAuthenticated, token, refreshCards, refreshUserVouchers])
  );

  const loadUserVouchers = async () => {
    if (!token) return;
    
    try {
      setLoadingUserVouchers(true);
      const response = await userVoucherApi.getUserVouchers();
      setUserVouchers(response.data.userVouchers.filter(v => v.status === 'active'));
    } catch (error) {
      console.error('Error loading user vouchers:', error);
    } finally {
      setLoadingUserVouchers(false);
    }
  };

  const loadCartData = async () => {
    try {
      await fetchCart(token!);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };



  const loadDefaultAddress = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/default-address`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const defaultAddress = data.data.address;
        
        // Chuyển đổi format để phù hợp với AddressSelector
        const addressForSelector: Address = {
          _id: defaultAddress._id,
          userId: defaultAddress.userId,
          name: defaultAddress.name,
          phone: defaultAddress.phone,
          address: defaultAddress.address,
          province: defaultAddress.province,
          district: defaultAddress.district,
          ward: defaultAddress.ward,
          isDefault: defaultAddress.isDefault,
          createdAt: defaultAddress.createdAt,
          updatedAt: defaultAddress.updatedAt
        };
        
        setSelectedAddress(addressForSelector);
      }
    } catch (error) {
      console.error('Error loading default address:', error);
    }
  };

  const selectedIdsParam = (params?.selected as string) || '';
  
  const effectiveSelectedIds = (selectedItemIds && selectedItemIds.length > 0)
    ? selectedItemIds
    : (selectedIdsParam ? selectedIdsParam.split(',') : (items || []).map((it: any) => it._id));
  const selectedIdSet = new Set(effectiveSelectedIds);
  console.log('🔍 Checkout Debug:', {
    selectedIdsParam,
    selectedItemIds,
    effectiveSelectedIds,
    selectedIdSet: Array.from(selectedIdSet),
    totalItems: items?.length,
    items: items?.map((it: any) => ({ id: it._id, name: it.productId?.nameProduct }))
  });

  const calculateSubtotal = () => {
    return (items || []).reduce((total, item: any) => {
      if (!selectedIdSet.has(item._id)) return total;
      const product = item.productId as any;
      const originalPrice = product?.priceProduct || 0;
      const discountPercent = product?.discount || 0;
      const finalPrice = originalPrice * (1 - discountPercent / 100);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    let total = calculateSubtotal();
    if (selectedUserVoucher) {
      total = total * (1 - selectedUserVoucher.discount / 100);
    }
    return total;
  };

  const calculateDiscount = () => {
    if (!selectedUserVoucher) return 0;
    return calculateSubtotal() * (selectedUserVoucher.discount / 100);
  };

  // Phí giao hàng và tổng cộng (để dùng thống nhất cho UI, tạo đơn và thanh toán)
  const getShippingFee = () => {
    const baseShipping = 25000;
    const hasFreeShip = !!selectedUserVoucher && /free\s*ship|freeship|miễn\s*phí\s*ship/i.test(
      selectedUserVoucher.description || selectedUserVoucher.code || ''
    );
    return hasFreeShip ? 0 : baseShipping;
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + getShippingFee();
  };

  const handleVoucherSelect = (voucher: any) => {
    selectVoucher(voucher);
    setShowVoucherModal(false);
  };

  const handleUserVoucherSelect = (userVoucher: ApiUserVoucher) => {
    setSelectedUserVoucher(userVoucher);
    setShowVoucherModal(false);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(false);
  };

  const handleCardSelect = (card: any) => {
    setSelectedCard(card);
    // Optimistic update: đưa card vừa chọn lên đầu danh sách cục bộ để UI phản hồi nhanh
    setUserCards(prev => {
      if (!prev) return prev;
      const others = prev.filter(c => c._id !== card._id);
      return [card, ...others];
    });
    setShowCardManagementModal(false);
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
              await refreshCards();
              
              // Nếu thẻ bị xóa là thẻ đang chọn, reset selection
              if (selectedCard?._id === cardId) {
                setSelectedCard(null);
              }
              
              Alert.alert('Thành công', 'Đã xóa thẻ thành công');
            } catch (error: any) {
              Alert.alert('Thông báo', 'Không thể xóa thẻ. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const handlePayment = async () => {
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập lại');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Thông báo', 'Vui lòng chọn/nhập đầy đủ địa chỉ giao hàng');
      return;
    }

    if (!selectedAddress.name || !selectedAddress.phone || !selectedAddress.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin địa chỉ giao hàng (tên, số điện thoại, địa chỉ)');
      return;
    }

    setIsProcessing(true);
    try {
      // Tạo đơn hàng - chỉ lấy các item được chọn
      const orderItems = (items || []).filter((item: any) => selectedIdSet.has(item._id)).map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: (item.productId.priceProduct * (1 - (item.productId.discount || 0) / 100))
      }));

      // Validate phone number
      const normalizedPhone = selectedAddress.phone.replace(/\s+/g, '');
      if (!/^0\d{9,10}$/.test(normalizedPhone)) {
        Alert.alert('Thông báo', 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số bắt đầu bằng 0');
        setIsProcessing(false);
        return;
      }

      if (selectedPaymentMethod === 'card' && !selectedCard) {
        Alert.alert('Thông báo', 'Vui lòng chọn thẻ thanh toán');
        setIsProcessing(false);
        return;
      }

      const orderData: CreateOrderRequest = {
        items: orderItems,
        totalAmount: calculateTotal(),
        paymentMethod: selectedPaymentMethod,
        userVoucherId: selectedUserVoucher?._id,
        voucherDiscount: selectedUserVoucher ? calculateDiscount() : 0,
        shippingAddress: {
          name: selectedAddress.name,
          phone: normalizedPhone,
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
              cardId: selectedCard!._id,
              method: 'card'
            })
          });

          if (verifyResponse.ok) {
            // Tạo thông báo: đã tạo đơn và gửi mã xác minh
            try {
              await createNotification(token!, {
                title: 'Xác minh thanh toán',
                message: `Đơn hàng #${createdOrder._id} đã tạo. Vui lòng xác minh thanh toán thẻ.`,
                type: 'order',
                relatedId: createdOrder._id,
                relatedModel: 'Order',
                icon: 'card'
              });
            } catch (e) {}
            setIsProcessing(false);
              router.replace({
              pathname: '/verify-payment' as any,
              params: {
                orderId: createdOrder._id,
                cardId: selectedCard!._id,
                  amount: calculateTotal(),
                  maskedCardNumber: selectedCard!.maskedCardNumber || selectedCard!.cardNumber
              }
            });
            return;
          }
        } catch (error) {
          console.error('Error sending payment verification:', error);
        }
        
        // Fallback: vẫn chuyển đến trang xác minh ngay cả khi gửi OTP thất bại
        // Tạo thông báo fallback
        try {
          await createNotification(token!, {
            title: 'Xác minh thanh toán',
            message: `Đơn hàng #${createdOrder._id} đã tạo. Vui lòng xác minh thanh toán thẻ.`,
            type: 'order',
            relatedId: createdOrder._id,
            relatedModel: 'Order',
            icon: 'card'
          });
        } catch (e) {}
        setIsProcessing(false);
        router.replace({
          pathname: '/verify-payment' as any,
          params: {
            orderId: createdOrder._id,
            cardId: selectedCard!._id,
            amount: calculateTotal(),
            maskedCardNumber: selectedCard!.maskedCardNumber || selectedCard!.cardNumber
          }
        });
        return;
      }

      // Xóa giỏ hàng sau khi tạo đơn hàng thành công (COD)
      await clearCart(token);

      // Tạo thông báo đặt hàng thành công (COD)
      try {
        await createNotification(token!, {
          title: 'Đặt hàng thành công',
          message: `Đơn hàng #${createdOrder._id} đã được tạo. Hình thức: COD.`,
          type: 'order',
          relatedId: createdOrder._id,
          relatedModel: 'Order',
          icon: 'bag'
        });
      } catch (e) {}

      setIsProcessing(false);
      Alert.alert(
        'Đặt hàng thành công',
        'Đơn hàng của bạn đã được tạo thành công!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/purchased-orders')
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

  // Thêm thẻ bằng Stripe PaymentSheet (SetupIntent) chỉ để lưu phương thức, không thanh toán
  const addCardViaPaymentSheet = async () => {
    if (!token) return;
    try {
      // 1) Tạo customer session (customerId + ephemeralKey)
      const sessionRes = await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/customer-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!sessionRes.ok) {
        const ed = await sessionRes.json().catch(() => ({}));
        throw new Error(ed.message || 'Không thể tạo phiên Stripe');
      }
      const session = await sessionRes.json();

      // 2) Tạo SetupIntent để lưu phương thức thanh toán
      const setupRes = await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/create-setup-intent`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!setupRes.ok) {
        const ed = await setupRes.json().catch(() => ({}));
        throw new Error(ed.message || 'Không thể tạo SetupIntent');
      }
      const setup = await setupRes.json();

      // 3) Khởi tạo và mở PaymentSheet (Test Mode)
      const init = await initPaymentSheet({
        setupIntentClientSecret: setup.data.clientSecret,
        merchantDisplayName: 'Strength Best',
        defaultBillingDetails: { name: selectedAddress?.name },
        customerId: session.data.customerId,
        customerEphemeralKeySecret: session.data.ephemeralKey,
      });
      if (init.error) throw new Error(init.error.message);

      const presentResult = await presentPaymentSheet();
      if (presentResult.error) throw new Error(presentResult.error.message);

      // Đồng bộ thẻ thủ công sau khi thêm thẻ (SetupIntent)
      try {
        await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/sync-payment-methods`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await refreshCards();
      } catch (e) {}

      // 4) Sau khi thêm thẻ xong, refresh danh sách thẻ và chọn thẻ mặc định/đầu tiên
      await refreshCards();
      const latestCards = await getUserCards(token);
      setUserCards(latestCards);
      const defaultCard = latestCards.find(c => c.isDefault) || latestCards[0];
      if (defaultCard) setSelectedCard(defaultCard);

      Alert.alert('Thành công', 'Đã thêm thẻ. Vui lòng nhấn Thanh toán để tiếp tục.');
    } catch (e: any) {
      Alert.alert('Thông báo', e.message || 'Không thể thêm thẻ');
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
        <TouchableOpacity onPress={() => router.replace('/cart')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <PullToRefresh
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 160 }}
        onRefresh={async () => {
          await Promise.all([
            refreshAddresses(),
            refreshCards(),
            refreshUserVouchers(),
            loadCartData(),
            fetchVouchers(token!)
          ]);
        }}
        refreshing={addressesLoading || cardsLoading || userVouchersLoading || loading}
      >
        {/* Update Status Bar */}
        <UpdateStatusBar
          lastUpdated={addressesLastUpdated}
          loading={addressesLoading}
          error={null}
        />

        

        {/* Address Section - Di chuyển lên đầu */}
        <AddressSelector
          selectedAddress={selectedAddress}
          onAddressSelect={(address) => {
            // Cập nhật địa chỉ ngay lập tức để hiển thị mượt mà
            setSelectedAddress(address);
            console.log('📍 Địa chỉ đã được cập nhật:', address.name, address.address);
          }}
        />

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          {(() => {
            const filteredItems = (items || []).filter((it: any) => selectedIdSet.has(it._id));
            console.log('🔍 Rendering order items:', {
              totalItems: items?.length,
              selectedIdSet: Array.from(selectedIdSet),
              filteredItemsCount: filteredItems.length,
              filteredItems: filteredItems.map((it: any) => ({ id: it._id, name: it.productId?.nameProduct }))
            });
            return (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Sản phẩm đặt hàng ({filteredItems.length})
                </Text>
                <FlatList
                  data={filteredItems}
                  renderItem={renderOrderItem}
                  keyExtractor={(item) => item._id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </>
            );
          })()}
        </View>

        {/* Voucher Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Mã giảm giá
            </Text>
            <TouchableOpacity onPress={() => setShowVoucherModal(true)}>
              <Text style={[styles.selectText, { color: colors.accent }]}>
                {selectedUserVoucher ? 'Thay đổi' : 'Chọn mã'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {selectedUserVoucher ? (
            <View style={styles.selectedVoucher}>
              <Text style={[styles.voucherCode, { color: colors.text }]}>
                {selectedUserVoucher.code}
              </Text>
              <Text style={[styles.voucherDiscount, { color: colors.accent }]}>
                -{selectedUserVoucher.discount}%
              </Text>
            </View>
          ) : (
            <Text style={[styles.noVoucherText, { color: colors.textSecondary }]}>
              Chưa có mã giảm giá
            </Text>
          )}
        </View>

        {/* Payment Method Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hình thức thanh toán</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(true)}>
                <Text style={[styles.selectText, { color: colors.accent }]}>Thay đổi</Text>
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

        {/* Card UI đã loại bỏ khỏi Checkout theo yêu cầu. Người dùng sẽ chọn/nhập thẻ trực tiếp trong PaymentSheet. */}

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

          {selectedUserVoucher && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Giảm giá
              </Text>
              <Text style={[styles.summaryValue, { color: colors.accent }]}>
                -{formatPrice(calculateDiscount())}
              </Text>
            </View>
          )}

          {/* Shipping fee + FreeShip voucher */}
          {(() => {
            const shippingFee = getShippingFee();
            const hasFreeShip = shippingFee === 0;
            return (
              <>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Phí giao hàng</Text>
                  <Text style={[styles.summaryValue, { color: hasFreeShip ? colors.accent : colors.text }]}>
                    {hasFreeShip ? '-Miễn phí' : formatPrice(shippingFee)}
                  </Text>
                </View>
                <View style={[styles.totalRow, { borderTopColor: colors.border }]}> 
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng cộng</Text> 
                  <Text style={[styles.totalValue, { color: colors.accent }]}>
                    {formatPrice(calculateGrandTotal())}
                  </Text>
                </View>
              </>
            );
          })()}
        </View>
      </PullToRefresh>

        {/* Payment Button */}
      <View style={[styles.paymentContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.paymentButton, { backgroundColor: colors.accent }]}
          onPress={async () => {
            if (selectedPaymentMethod === 'card') {
              // Kiểm tra địa chỉ giao hàng trước khi thanh toán
              if (!selectedAddress || !selectedAddress.name || !selectedAddress.phone || !selectedAddress.address) {
                Alert.alert('Lỗi', 'Vui lòng chọn/nhập đầy đủ địa chỉ giao hàng');
                return;
              }
              try {
                // 1) Tạo customer session (customerId + ephemeralKey)
                const sessionRes = await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/customer-session`, {
                  method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!sessionRes.ok) throw new Error('Không thể tạo phiên Stripe');
                const session = await sessionRes.json();

                // 2) Tạo PaymentIntent để hiển thị PaymentSheet (có thể chọn thẻ đã lưu hoặc thêm thẻ mới) và thanh toán ngay
                const resp = await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/create-payment-intent`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ amount: Math.round(calculateGrandTotal()), orderId: (cart as any)?._id || 'temp' })
                });
                if (!resp.ok) throw new Error('Không thể tạo PaymentIntent');
                const data = await resp.json();

                // 3) Khởi tạo và mở PaymentSheet (PaymentIntent)
                const init = await initPaymentSheet({
                  paymentIntentClientSecret: data.data.clientSecret,
                  merchantDisplayName: 'Strength Best',
                  customerId: session.data.customerId,
                  customerEphemeralKeySecret: session.data.ephemeralKey,
                });
                if (init.error) throw new Error(init.error.message);

                const present = await presentPaymentSheet();
                if (present.error) throw new Error(present.error.message);

                // Đồng bộ thẻ thủ công sau khi thanh toán qua PaymentSheet
                try {
                  await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/sync-payment-methods`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  await refreshCards();
                } catch (e) {}

                // 4) Sau khi người dùng thanh toán thành công trong PaymentSheet → tạo đơn hàng và xác nhận ở backend
                const createdOrder = await createOrder(token!, {
                  items: (items || []).filter((item: any) => selectedIdSet.has(item._id)).map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: (item.productId.priceProduct * (1 - (item.productId.discount || 0) / 100))
                  })),
                  totalAmount: calculateGrandTotal(),
                  paymentMethod: 'card',
                  userVoucherId: selectedUserVoucher?._id,
                  voucherDiscount: selectedUserVoucher ? calculateDiscount() : 0,
                  shippingAddress: {
                    name: selectedAddress!.name,
                    phone: selectedAddress!.phone,
                    address: selectedAddress!.address,
                    province: selectedAddress!.province || '',
                    district: selectedAddress!.district || '',
                    ward: selectedAddress!.ward || ''
                  }
                } as any);

                await fetch(`${API_CONFIG.BASE_URL}/payments/stripe/confirm`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ orderId: createdOrder._id, paymentIntentId: data.data.paymentIntentId, amount: Math.round(calculateGrandTotal()) })
                });

                await clearCart(token!);
                clearSelectedItems();
                Alert.alert('Thành công', 'Thanh toán thành công!', [{ text: 'OK', onPress: () => router.replace('/purchased-orders') }]);
              } catch (err: any) {
                Alert.alert('Thanh toán', err.message || 'Thanh toán thất bại');
              }
              return;
            } else {
              await handlePayment();
            }
          }}
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
                {formatPrice(calculateGrandTotal())}
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
            
            {loadingUserVouchers ? (
              <ActivityIndicator size="large" color={colors.accent} style={styles.loadingContainer} />
            ) : userVouchers.length > 0 ? (
              <FlatList
                data={userVouchers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.voucherItem}
                    onPress={() => handleUserVoucherSelect(item)}
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
            ) : (
              <View style={styles.emptyVouchers}>
                <Ionicons name="ticket-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyVouchersText, { color: colors.textSecondary }]}>
                  Chưa có voucher nào
                </Text>
                <Text style={[styles.emptyVouchersSubtext, { color: colors.textSecondary }]}>
                  Đổi voucher trong phần Quà tặng để nhận ưu đãi
                </Text>
              </View>
            )}
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

      {/* Đã loại bỏ modal Quản lý thẻ trong Checkout */}
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  // Empty Vouchers Styles
  emptyVouchers: {
    alignItems: 'center',
    padding: 40,
  },
  emptyVouchersText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyVouchersSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  cardAddedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardAddedMessageText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CheckoutScreen;
