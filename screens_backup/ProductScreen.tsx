import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
interface Product {
  id: string;
  name: string;
  price: string;
  category?: string;
  image?: string;
}
const ProductScreen: React.FC = () => {
  const products = [
    { id: '1', name: 'Magic Blackmores', price: '500', category: 'Quà tặng' },
    { id: '2', name: 'Dầu cá omega', price: '500', category: 'Quà tặng' },
    { id: '3', name: 'Blackmores Bio C Powder', price: '400', category: 'Sản phẩm' },
    { id: '4', name: 'Blackmores Natural', price: '300', category: 'Sản phẩm' },
  ];

 
   const renderProduct = ({ item }: { item: Product }) => (
     <TouchableOpacity style={styles.productItem}>
       <Image source={{ uri: item.image || 'path_to_image' }} style={styles.productImage} />
       <Text>{item.name}</Text>
       <Text>{item.price} đ</Text>
     </TouchableOpacity>
   );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <Text style={styles.activeTab}>Quà tặng</Text>
        <Text>Số lượng</Text>
        <Text>Mua</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
      />
      <View style={styles.pagination}>
        <Text>1</Text>
        <Text>2</Text>
        <Text>3</Text>
        <Text>4</Text>
        <Text>5</Text>
      </View>
      <View style={styles.footer}>
        <Text>support@openl design</Text>
        <Text>08:00 - 22:00 Everyday</Text>
        <View style={styles.footerLinks}>
          <Text>About</Text>
          <Text>Contact</Text>
          <Text>Blog</Text>
        </View>
        <Text>Copyright © OpenL! All Rights Reserved</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  activeTab: { fontWeight: 'bold' },
  productItem: { flex: 1, margin: 5, alignItems: 'center' },
  productImage: { width: 100, height: 100 },
  pagination: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerLinks: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
});

export default ProductScreen;