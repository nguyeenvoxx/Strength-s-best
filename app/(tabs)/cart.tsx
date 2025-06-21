import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const CartScreen: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([
    { id: '1', name: 'Magic Blackmores', price: 1500000, quantity: 1, text: 'Neque porro...', image: require('../../assets/images_sp/magie_blackmores.png') },
    { id: '2', name: 'Dầu cá omega', price: 1410000, quantity: 1, text: 'Neque porro...', image: require('../../assets/images_sp/dau_ca_omega.png') },
  ]);
  
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

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
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
              <Image source={item.image} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 20 }}>{item.name}</Text>
                <Text>{item.text}</Text>
                <Text>{`${item.price.toLocaleString()} vnđ x ${item.quantity}`}</Text>
                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                  <TouchableOpacity onPress={() => handleDecrease(item.id)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleIncrease(item.id)} style={styles.qtyButton}>
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        <View style={{ padding: 10, marginTop: 10 }}>
          <Text>Tổng số lượng: {totalQuantity}</Text>
          <Text style={{ fontWeight: 'bold' }}>{`Tổng tiền: ${totalPrice.toLocaleString()} vnđ`}</Text>
        </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/order-summary')}>
          <Text style={styles.textButton}>Thanh Toán</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  qtyButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },  qtyText: {
    fontSize: 18,
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
    backgroundColor: '#007bff',
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
    backgroundColor: '#ff69b4', 
    padding: 15, 
    alignItems: 'center', 
    marginTop: 20, 
    borderRadius: 10, 
    width: 295, 
    alignSelf: 'center' 
  },
});

export default CartScreen;
