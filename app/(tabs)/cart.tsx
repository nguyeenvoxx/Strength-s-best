import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { API_CONFIG } from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

const CartScreen: React.FC = () => {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { cart, items: cartItems, loading, error, fetchCart, addToCart, removeFromCart, clearCart, clearError } = useCartStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  // Khi user đổi, load lại địa chỉ giao hàng của user hiện tại
  React.useEffect(() => {
    const loadSelectedAddress = async () => {
      try {
        const userId = user?._id || (user as any)?.id;
        if (!userId) return;
        const savedAddresses = await AsyncStorage.getItem(`userAddresses_${userId}`);
        if (savedAddresses) {
          const addresses = JSON.parse(savedAddresses);
          // Ưu tiên địa chỉ mặc định, nếu không có thì lấy đầu tiên
          const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
          setSelectedAddress(defaultAddress);
        } else {
          setSelectedAddress(null);
        }
      } catch (e) {
        setSelectedAddress(null);
      }
    };
    loadSelectedAddress();
  }, [user?._id]);

  const handleSelectAddress = () => {
    router.push('/select-address');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const [fontsLoaded] = useFonts({
    'PlayfairDisplay': require('../../assets/fonts/PlayfairDisplay-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleIncrease = async (item: any) => {
    if (token) {
      await addToCart(token, item.idProduct, item.quantity + 1);
    }
  };

  const handleDecrease = async (item: any) => {
    if (token) {
      if (item.quantity > 1) {
        await addToCart(token, item.idProduct, item.quantity - 1);
      } else {
        await removeFromCart(token, item.idProduct);
      }
    }
  };

  const handleDelete = async (productId: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => token && removeFromCart(token, productId) }
      ]
    );
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa toàn bộ giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: async () => {
          if (token) {
            await clearCart(token);
            setSelectedIds([]);
            Alert.alert('Thành công', 'Đã xóa toàn bộ giỏ hàng');
          }
        }}
      ]
    );
  };

  //TRUYỀN DỮ LIỆU TỪ GIỎ HÀNG
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
      return;
    }
    router.push({
      pathname: '/checkout',
      params: { selected: JSON.stringify(selectedItems) },
    });
  };

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.idProduct._id));
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  // Tính tổng tiền
  const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  // Helper function to get price in VND
  const getPriceVND = (price: any) => {
    const n = Number(String(price).replace(/[^0-9.-]+/g, ''));
    return n < 1000 ? n * 1000 : n;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.emptyCart}>
          <Text>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { clearError(); token && fetchCart(token); }}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>

        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#469B43" />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('./home')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.viewGroup}>
          <Image style={styles.iconGroup} source={require('../../assets/images/Group_icon.png')} />
          <Text style={styles.tileGroup}>Địa chỉ</Text>
        </View>

        <TouchableOpacity style={styles.Address} onPress={handleSelectAddress}>
          <View style={styles.addressBox}>
            <TouchableOpacity style={styles.iconEdit}>
              <Image style={styles.EditIcon} source={require('../../assets/images/edit_icon.png')} />
            </TouchableOpacity>
            <Text style={styles.tile1}>Địa chỉ:</Text>
            <Text style={styles.addressName}>{selectedAddress?.name || 'Chưa có địa chỉ'}</Text>
            <Text style={styles.addressText}>{selectedAddress?.address || 'Vui lòng chọn địa chỉ'}</Text>
            <Text style={styles.addressPhone}>SĐT: {selectedAddress?.phone || 'Chưa có số điện thoại'}</Text>
          </View>
          <TouchableOpacity style={styles.plusBox}>
            <Image source={require('../../assets/images/plus_icon.png')} />
          </TouchableOpacity>
        </TouchableOpacity>
        
        <View>
          <Text style={styles.shoppingListTitle}>
            Danh sách mua sắm
          </Text>
        </View>
        <View>
          {cartItems.map(item => (
            <View key={item._id} style={styles.cartItem}>
              <TouchableOpacity
                onPress={() => toggleSelect(item.idProduct._id)}
                style={[styles.checkbox, selectedIds.includes(item.idProduct._id) && styles.checkboxSelected]}
              >
                {selectedIds.includes(item.idProduct._id) && <Text style={{ color: '#fff' }}>✓</Text>}
              </TouchableOpacity>

              <Image 
                source={{ uri: `${API_CONFIG.BASE_URL}/uploads/${item.idProduct.image}` }} 
                style={styles.productImage} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20 }}>
                  {item.idProduct.nameProduct}
                </Text>
                <Text style={{ color: '#666', marginBottom: 5 }}>
                  {item.idProduct.description}
                </Text>
                <Text style={{ fontWeight: 'bold', color: '#469B43', fontSize: 16 }}>
                  {formatPrice(getPriceVND(item.price))}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '300' }}>
                    Số lượng: {item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ padding: 10, marginTop: 10 }}>
          <Text>Tổng số lượng: {totalQuantity}</Text>
          <Text style={{ fontWeight: 'bold' }}> {`Tổng tiền: ${formatPrice(getPriceVND(totalPrice))}`}</Text></View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.textButton}>Thanh Toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  checkboxSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  qtyButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText_: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  Address: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 0,
    gap: 15,
    borderRadius: 10,
    marginTop: 12
  },
  plusBox: {
    width: 60,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  iconGroup: {
    height: 20,
    width: 17,
    marginEnd: 10,
    marginLeft: 10,
    fontWeight: 100
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
  viewGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  tileGroup: {
    fontSize: 20,
    fontWeight: '600',
  },
  tile1: {
    fontSize: 15,
    fontWeight: '500',
  },
  shoppingListTitle: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textButton: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#469B43',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  productImage: {
    width: 130,
    height: 125,
    marginRight: 10
  },
  checkoutButton: {
    backgroundColor: '#469B43',
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 10,
    width: 295,
    alignSelf: 'center'
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 15,
    padding: 5,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
  },
});

export default CartScreen;
