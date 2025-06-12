import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const CartScreen: React.FC = () => {
  const items = [
    { id: '1', name: 'Magic Blackmores', price: '1,500', image: 'path_to_image' },
    { id: '2', name: 'Dầu cá omega', price: '1,400', image: 'path_to_image' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.address}>
        <Text>Địa chỉ</Text>
        <Text>Hà Nội, Việt Nam</Text>
      </View>
      {items.map(item => (
        <View key={item.id} style={styles.cartItem}>
          <Image source={{ uri: item.image }} style={styles.productImage} />
          <View>
            <Text>{item.name}</Text>
            <Text>{item.price} đ</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.checkoutButton}>
        <Text>Voucher</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  address: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  productImage: { width: 50, height: 50, marginRight: 10 },
  checkoutButton: { backgroundColor: '#ff69b4', padding: 15, alignItems: 'center', marginTop: 20 },
});

export default CartScreen;