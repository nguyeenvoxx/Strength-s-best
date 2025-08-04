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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPrice } from '../../utils/productUtils';
import { useTheme } from '../../store/ThemeContext';

interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

const CartScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#FF6B35',
    border: '#404040'
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#FF6B35',
    border: '#e0e0e0'
  };

  const { cart, items, loading, error, fetchCart, addToCart, removeFromCart, deleteFromCart, clearCart } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);

  // Load cart data
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartData();
    }
  }, [isAuthenticated, token]);

  const loadCartData = async () => {
    try {
      await fetchCart(token!);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };



  const handleIncrease = async (productId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Đăng nhập cần thiết', 'Vui lòng đăng nhập để sử dụng giỏ hàng');
      router.push('/(auth)/sign-in');
      return;
    }

    try {
      await addToCart(token!, productId, 1);
    } catch (error) {
      console.error('Error increasing quantity:', error);
      Alert.alert('Lỗi', 'Không thể tăng số lượng sản phẩm');
    }
  };

  const handleDecrease = async (productId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Đăng nhập cần thiết', 'Vui lòng đăng nhập để sử dụng giỏ hàng');
      router.push('/(auth)/sign-in');
      return;
    }

    console.log('=== CART SCREEN: DECREASE QUANTITY ===');
    console.log('Product ID:', productId);
    console.log('Token:', token ? 'Present' : 'Missing');

    try {
      await removeFromCart(token!, productId);
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      Alert.alert('Lỗi', 'Không thể giảm số lượng sản phẩm');
    }
  };

  const handleDelete = async (productId: string) => {
    console.log('=== CART SCREEN: DELETE ITEM ===');
    console.log('Product ID:', productId);
    console.log('Token:', token ? 'Present' : 'Missing');

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFromCart(token!, productId);
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart(token!);
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Lỗi', 'Không thể xóa giỏ hàng');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert('Đăng nhập cần thiết', 'Vui lòng đăng nhập để thanh toán');
      router.push('/(auth)/sign-in');
      return;
    }

    if (!items || items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
      return;
    }

    // Navigate to checkout
    router.push('/checkout');
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      const product = item.productId as any;
      const originalPrice = product?.priceProduct || 0;
      const discountPercent = product?.discount || 0;
      const finalPrice = originalPrice * (1 - discountPercent / 100);
      return total + (finalPrice * item.quantity);
    }, 0);
  };

    const renderCartItem = ({ item }: { item: any }) => {
    const product = item.productId as any;
    const originalPrice = product?.priceProduct || 0;
    const discountPercent = product?.discount || 0;
    const finalPrice = originalPrice * (1 - discountPercent / 100);
    
    return (
      <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
        <Image
          source={{ uri: product?.image !== 'https://via.placeholder.com/300x300?text=No+Image' 
            ? product?.image 
            : 'https://via.placeholder.com/80x80?text=Product' }}
          style={styles.productImage}
          resizeMode="cover"
          defaultSource={require('../../assets/images_sp/dau_ca_omega.png')}
          onError={(error) => {
            console.log('🔍 Cart Image load error:', error.nativeEvent.error);
          }}
          onLoad={() => {
            console.log('🔍 Cart Image loaded successfully');
          }}
        />
        
        <View style={styles.itemDetails}>
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
            {product?.nameProduct || 'Sản phẩm'}
          </Text>
          
          {/* Price Display */}
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
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.border }]}
            onPress={() => handleDecrease(item.productId._id)}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: colors.text }]}>
            {item.quantity}
          </Text>
          
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.border }]}
            onPress={() => handleIncrease(item.productId._id)}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.productId._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loginPrompt, { backgroundColor: colors.card }]}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.loginTitle, { color: colors.text }]}>
            Đăng nhập để xem giỏ hàng
          </Text>
          <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>
            Vui lòng đăng nhập để sử dụng tính năng giỏ hàng
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
            Đang tải giỏ hàng...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Giỏ hàng</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={[styles.clearButton, { color: colors.accent }]}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={[styles.emptyCart, { backgroundColor: colors.card }]}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
                     <Text style={[styles.emptyTitle, { color: colors.text }]}>
             Giỏ hàng trống
           </Text>
           <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
             Hãy thêm sản phẩm vào giỏ hàng
           </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartList}
          />



          {/* Order Summary */}
          <View style={[styles.orderSummary, { backgroundColor: colors.card }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
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

            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Tổng cộng
              </Text>
              <Text style={[styles.totalValue, { color: colors.accent }]}>
                {formatPrice(calculateSubtotal())}
              </Text>
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.accent }]}
            onPress={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>
                Thanh toán ({items.length} sản phẩm)
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}


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
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  summaryContainer: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  checkoutContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  checkoutButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
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
  voucherSection: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectVoucherText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedVoucher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  noVoucherText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  voucherItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  voucherInfo: {
    flex: 1,
  },
  voucherDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  voucherExpiry: {
    fontSize: 10,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  cartList: {
    paddingBottom: 100, // Add padding for the checkout button
  },
  orderSummary: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
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

});

export default CartScreen;
