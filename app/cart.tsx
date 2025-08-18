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
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSelectedItemsStore } from '../store/useSelectedItemsStore';
import { formatPrice, getProductImageUrl } from '../utils/productUtils';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

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
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const { cart, items, loading, error, fetchCart, addToCart, removeFromCart, deleteFromCart, clearCart } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();
  const { setSelectedItemIds } = useSelectedItemsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [confirmedLargeQuantity, setConfirmedLargeQuantity] = useState<Set<string>>(new Set());

  // Khi danh sách items thay đổi, chỉ thêm các item mới vào selectedMap (không reset)
  useEffect(() => {
    console.log('🔍 Items changed, current items:', items?.map((it: any) => it._id));
    console.log('🔍 Current selectedMap before update:', selectedMap);
    
    if (!items || items.length === 0) {
      setSelectedMap({});
      return;
    }
    
    setSelectedMap(prev => {
      const next = { ...prev };
      // Chỉ thêm các item mới chưa có trong selectedMap
      (items || []).forEach((it: any) => {
        if (!(it._id in next)) {
          next[it._id] = true; // Mặc định chọn item mới
        }
      });
      // Xóa các item không còn tồn tại trong items
      Object.keys(next).forEach(id => {
        if (!items.find((it: any) => it._id === id)) {
          delete next[id];
        }
      });
      
      console.log('🔍 Updated selectedMap:', next);
      return next;
    });
  }, [items]);

  // Load cart data
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartData();
    }
  }, [isAuthenticated, token]);

  // Revalidate khi quay lại màn hình giỏ hàng
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && token) loadCartData();
      return () => {};
    }, [isAuthenticated, token])
  );

  const loadCartData = async () => {
    try {
      console.log('🔄 Loading cart data...');
      await fetchCart(token!);
      console.log('✅ Cart data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      // Không throw error để tránh crash app
    }
  };



  const handleIncrease = async (productId: string) => {
    try {
      console.log('🔄 Starting handleIncrease for productId:', productId);
      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để thực hiện thao tác này');
        return;
      }

      const item = items.find(item => item.productId._id === productId);
      if (!item) {
        console.log('❌ Item not found in cart');
        return;
      }
      
      console.log('📦 Current item quantity:', item.quantity);
      console.log('📦 Product stock:', (item.productId as any)?.quantity);

      const newQuantity = item.quantity + 1;
      const productStock = (item.productId as any)?.quantity || 0;

      // Kiểm tra số lượng tồn kho
      if (newQuantity > productStock) {
        Alert.alert('Thông báo', `Chỉ còn ${productStock} sản phẩm trong kho`);
        return;
      }

      // Kiểm tra số lượng lớn (>15) trước khi thêm
      if (newQuantity > 15 && !confirmedLargeQuantity.has(productId)) {
        Alert.alert(
          'Xác nhận mua hàng',
          'Bạn đang mua quá nhiều sản phẩm. Bạn có chắc chắn muốn mua không?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mua', onPress: async () => {
              try {
                // Đánh dấu đã xác nhận cho sản phẩm này
                setConfirmedLargeQuantity(prev => new Set(prev).add(productId));
                
                const result = await addToCart(token, productId, 1);
                if (result.success) {
                  // Không cần loadCartData vì cart đã được cập nhật từ response
                } else if (result.shouldAdjust) {
                  // Hiển thị thông báo tồn kho và tự động điều chỉnh
                  Alert.alert(
                    'Thông báo tồn kho',
                    result.message,
                    [
                      {
                        text: 'OK',
                        onPress: async () => {
                          try {
                            // Tự động điều chỉnh về số lượng tối đa
                            await addToCart(token, productId, result.availableQuantity!);
                            // Không cần loadCartData vì cart đã được cập nhật từ response
                            // Không hiển thị thông báo khi đã đạt tối đa
                          } catch (error: any) {
                            Alert.alert('Thông báo', 'Không thể cập nhật số lượng sản phẩm');
                          }
                        }
                      }
                    ]
                  );
                }
              } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Không thể tăng số lượng sản phẩm';
                Alert.alert('Thông báo', errorMessage);
              }
            }}
          ]
        );
        return;
      }

      // Thêm bình thường nếu không vượt quá 15
      console.log('📤 Calling addToCart with quantity 1');
      console.log('📤 Product ID:', productId);
      console.log('📤 Token:', token ? 'Present' : 'Missing');
      const result = await addToCart(token, productId, 1);
      console.log('📥 AddToCart result:', result);
      console.log('📥 Result type:', typeof result);
      console.log('📥 Result keys:', result ? Object.keys(result) : 'null/undefined');
      
      // Xử lý kết quả từ API
      if (result.success) {
        console.log('✅ AddToCart successful, cart data already updated');
        // Không cần loadCartData vì cart đã được cập nhật từ response
      } else if (result.shouldAdjust) {
        // Hiển thị thông báo tồn kho và tự động điều chỉnh
        Alert.alert(
          'Thông báo tồn kho',
          result.message,
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  // Tự động điều chỉnh về số lượng tối đa
                  await addToCart(token, productId, result.availableQuantity!);
                  // Không cần loadCartData vì cart đã được cập nhật từ response
                  // Không hiển thị thông báo khi đã đạt tối đa
                } catch (error: any) {
                  Alert.alert('Thông báo', 'Không thể cập nhật số lượng sản phẩm');
                }
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.log('❌ Error in handleIncrease:', error);
      console.log('❌ Error response:', error.response);
      console.log('❌ Error message:', error.message);
      const errorMessage = error.response?.data?.message || 'Không thể tăng số lượng sản phẩm';
      Alert.alert('Thông báo', errorMessage);
    }
  };

  const handleDecrease = async (productId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Đăng nhập cần thiết', 'Vui lòng đăng nhập để sử dụng giỏ hàng');
      router.push('/(auth)/sign-in');
      return;
    }

    try {
      console.log('🔄 Starting handleDecrease for productId:', productId);
      await removeFromCart(token!, productId);
      console.log('✅ RemoveFromCart successful, cart data already updated');
      // Không cần loadCartData vì cart đã được cập nhật từ response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể giảm số lượng sản phẩm';
      Alert.alert('Thông báo', errorMessage);
    }
  };

  const handleDelete = async (productId: string) => {


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
              console.log('🔄 Starting handleDelete for productId:', productId);
              await deleteFromCart(token!, productId);
              console.log('✅ DeleteFromCart successful, cart data already updated');
              // Không cần loadCartData vì cart đã được cập nhật từ response
            } catch (error: any) {
              const errorMessage = error.response?.data?.message || 'Không thể xóa sản phẩm';
              Alert.alert('Thông báo', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Xóa tất cả sản phẩm',
      `Bạn có chắc chắn muốn xóa tất cả ${items.length} sản phẩm khỏi giỏ hàng?\n\nHành động này không thể hoàn tác.`,
      [
        { 
          text: 'Hủy bỏ', 
          style: 'cancel',
          onPress: () => console.log('Clear cart cancelled')
        },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
                          try {
                setIsLoading(true);
                console.log('🔄 Starting handleClearCart');
                await clearCart(token!);
                console.log('✅ ClearCart successful, cart data already updated');
                // Không cần loadCartData vì cart đã được cập nhật từ response
                // Hiển thị thông báo thành công
                Alert.alert(
                  'Thành công',
                  'Đã xóa tất cả sản phẩm khỏi giỏ hàng',
                  [{ text: 'OK' }]
                );
              } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert(
                'Lỗi', 
                'Không thể xóa giỏ hàng. Vui lòng thử lại.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
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

    // Lọc các item được tick chọn
    const selectedIds = Object.keys(selectedMap).filter(id => selectedMap[id]);
    console.log('🔍 Cart Debug:', {
      selectedMap,
      selectedIds,
      selectedIdsString: selectedIds.join(','),
      totalItems: items?.length,
      allItemIds: items?.map((it: any) => it._id)
    });
    
    if (selectedIds.length === 0) {
      Alert.alert('Chọn sản phẩm', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Lưu selected items vào global store
    setSelectedItemIds(selectedIds);
    console.log('🔍 Saved selected items to store:', selectedIds);
    
    // Navigate to checkout
    router.push('./checkout' as any);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      if (!selectedMap[item._id]) return total;
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
    
    // Kiểm tra trạng thái sản phẩm
    const productStock = product?.quantity || 0;
    const isOutOfStock = productStock <= 0;
    const isAtMaxStock = false; // Không disable nút tăng, để logic backend xử lý
    const isSuspended = product?.status === 'inactive';
    
    const checked = !!selectedMap[item._id];
    return (
      <View style={[styles.cartItem, { backgroundColor: colors.card }]}> 
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => {
            const newValue = !checked;
            console.log('🔍 Toggle checkbox for item:', item._id, 'from', checked, 'to', newValue);
            setSelectedMap(prev => ({ ...prev, [item._id]: newValue }));
          }}
        >
          <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={22} color={checked ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
        <Image
          source={{ uri: getProductImageUrl(product?.image) }}
          style={styles.productImage}
          resizeMode="cover"
          defaultSource={require('../assets/images_sp/dau_ca_omega.png')}
          onError={() => {}}
        />
        
        <View style={styles.itemDetails}>
          <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
            {product?.nameProduct || 'Sản phẩm'}
          </Text>

          {/* Price row */}
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

          {/* Stock status */}
          {isOutOfStock && (
            <Text style={[styles.stockStatus, { color: '#c62828' }]}>
              ⚠️ Sản phẩm đã hết hàng
            </Text>
          )}
          {isSuspended && (
            <Text style={[styles.stockStatus, { color: '#ff9800' }]}>
              ⏸️ Sản phẩm tạm ngưng
            </Text>
          )}

          {/* Quantity row under text */}
          <View style={styles.quantityRow}>
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
                style={[
                  styles.quantityButton, 
                  { 
                    backgroundColor: isSuspended ? '#ccc' : colors.border,
                    opacity: isSuspended ? 0.5 : 1
                  }
                ]}
                onPress={() => handleIncrease(item.productId._id)}
                disabled={isSuspended}
              >
                <Ionicons name="add" size={16} color={isSuspended ? '#999' : colors.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.productId._id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff4757" />
            </TouchableOpacity>
          </View>
        </View>
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
          <TouchableOpacity 
            style={[
              styles.clearButton, 
              { 
                backgroundColor: isLoading ? colors.textSecondary : colors.danger,
                opacity: isLoading ? 0.7 : 1
              }
            ]} 
            onPress={handleClearCart}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" style={styles.clearButtonIcon} />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#fff" style={styles.clearButtonIcon} />
            )}
            <Text style={styles.clearButtonText}>
              {isLoading ? 'Đang xóa...' : 'Xóa tất cả'}
            </Text>
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
            onPress={() => router.push('./home')}
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
            contentContainerStyle={[styles.cartList, { paddingBottom: 160 }]}
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

        </>
      )}

      {/* Fixed Checkout Button */}
      {items && items.length > 0 && (
        <View style={[styles.checkoutContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: Object.keys(selectedMap).filter(id => selectedMap[id]).length > 0 ? colors.accent : colors.textSecondary }]}
            onPress={handleCheckout}
            disabled={isLoading || Object.keys(selectedMap).filter(id => selectedMap[id]).length === 0}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>
                Thanh toán ({Object.keys(selectedMap).filter(id => selectedMap[id]).length} sản phẩm)
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  clearButtonIcon: {
    marginRight: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    marginRight: 10,
  },
  productImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  priceContainer: {
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginLeft: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginBottom: 0,
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: '700',
    marginHorizontal: 10,
    minWidth: 26,
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
    position: 'absolute',
    bottom: 70, // Trên bottom tabs
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
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
    backgroundColor: '#4CAF50',
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
  stockStatus: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },

});

export default CartScreen; 