import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
// lấy luu giỏ hàng
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const CartScreen: React.FC = () => {
  const router = useRouter();
  // Lấy dữ liệu giỏ hàng từ AsyncStorage
  const [cartItems, setCartItems] = useState<any[]>([]);
  useFocusEffect(
    useCallback(() => {
      const loadCart = async () => {
        const data = await AsyncStorage.getItem('cart');
        setCartItems(data ? JSON.parse(data) : []);
      };
      loadCart();
    }, [])
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const handleIncrease = (id: string) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
    );
  };

  const handleDecrease = (id: string) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
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
  // Xóa sản phẩm khỏi giỏ hàng
  const handleDelete = async (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  // Tính tổng tiền
  const totalPrice = selectedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>

        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#469B43" />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.viewGroup}>
          <Image style={styles.iconGroup} source={require('../../assets/images/Group_icon.png')} />
          <Text style={styles.tileGroup}>Địa chỉ</Text>
        </View>

        <View style={styles.Address}>
          <View style={styles.addressBox}>
            <TouchableOpacity style={styles.iconEdit}>
              <Image style={styles.EditIcon} source={require('../../assets/images/edit_icon.png')} />
            </TouchableOpacity>
            <Text style={styles.tile1}>Địa chỉ:</Text>
            <Text>Hoàng triệu Tâm Nhân</Text>
            <Text>120 Quang Trung, P14, Quận Gò Vấp, TPHCM</Text>
            <Text>SĐT: +84-32842324</Text>
          </View>
          <TouchableOpacity style={styles.plusBox}>
            <Image source={require('../../assets/images/plus_icon.png')} />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.shoppingListTitle}>
            Danh sách mua sắm
          </Text>
        </View>

        <View>
          {cartItems.map(item => (
            <View key={item.id} style={styles.cartItem}>

              <TouchableOpacity
                onPress={() => toggleSelect(item.id)}
                style={[styles.checkbox, selectedIds.includes(item.id) && styles.checkboxSelected]}
              >
                {selectedIds.includes(item.id) && <Text style={{ color: '#fff' }}>✓</Text>}
              </TouchableOpacity>

              <Image source={typeof item.image === 'number' ? item.image : { uri: item.image }} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 20 }}>{item.name}</Text>
                <Text>{item.text}</Text>
                <Text>{formatPrice(item.price)}</Text>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>

                  <TouchableOpacity onPress={() => handleDecrease(item.id)} style={styles.qtyButton}>
                    <Text style={styles.qtyText_}>-</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 2, fontSize: 16,marginRight:10}}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => handleIncrease(item.id)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={{ color: 'red', marginTop: 5 }}>Xoá</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={{ padding: 10, marginTop: 10 }}>
          <Text>Tổng số lượng: {totalQuantity}</Text>
          <Text style={{ fontWeight: 'bold' }}> {`Tổng tiền: ${formatPrice(totalPrice)}`}</Text></View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.textButton}>Thanh Toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: '#333',
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
});

export default CartScreen;
