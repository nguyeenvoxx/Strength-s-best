import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


type RootStackParamList = {
  QRCodePayment: undefined;
  Home: undefined;
  Profile: undefined;
  Cart: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;


interface Product {
  id: string;
  name: string;
  price: string;
  category?: string;
  image?: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const products: Product[] = [
    { id: '1', name: 'Magic Blackmores', price: '500', category: 'Sản phẩm' },
    { id: '2', name: 'Dầu cá omega', price: '500', category: 'Sản phẩm' },
    { id: '3', name: 'Blackmores Bio C Powder', price: '400', category: 'Quà tặng' },
    { id: '4', name: 'Blackmores Natural', price: '300', category: 'Quà tặng' },
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
          <Text style={styles.activeTab}>Sản phẩm</Text>
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


      <View style={styles.MenuTab}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../images/home_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Image source={require('../images/heart_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Cart')}>
          <Image source={require('../images/shopping-cart_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Image source={require('../images/search_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../images/settings_icon.png')} />
        </TouchableOpacity>
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  MenuTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  menuButton: {
    padding: 10,
  },
  container: { flex: 1, padding: 10 },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  activeTab: { fontWeight: 'bold' },
  productItem: { flex: 1, margin: 5, alignItems: 'center' },
  productImage: { width: 100, height: 100 },
  pagination: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerLinks: { flexDirection: 'row', justifyContent: 'space-around', width: '60%' },
});

export default HomeScreen;