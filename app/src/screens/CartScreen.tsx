import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type RootStackParamList = {
  QRCodePayment: undefined;
  Home: undefined;
  Profile: undefined;
  Cart: undefined;
  OrderSummary:undefined;
  PaymentSuccess: undefined;
}

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const items = [
    { id: '1', name: 'Magic Blackmores', price: '1,500,000', Text: 'Neque porro quisquam est qui dolorem ipsum quia', image: require('../images_sp/magie_blackmores.png') },
    { id: '2', name: 'Dầu cá omega', price: '1,400,000', Text: 'Neque porro quisquam est qui dolorem ipsum quia', image: require('../images_sp/dau_ca_omega.png') },
  ];
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay': require('../fonts/PlayfairDisplay-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return null; // hoặc có thể return <Text>Loading...</Text>
  }
  return (

    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {/* <View style={styles.flex}>
        <TouchableOpacity style={styles.backButton}>
          <Image source={require('../images/back_icon.png')} />
        </TouchableOpacity>
        <Text style={styles.tile}>Giỏ hàng</Text>
      </View> */}

        <View style={styles.viewGroup}>
          <Image style={styles.iconGroup} source={require('../images/Group_icon.png')} />
          <Text style={styles.tileGroup}>Địa chỉ</Text>
        </View>

        <View style={styles.Address}>
          <View style={styles.addressBox}>
            <TouchableOpacity style={styles.iconEdit}>
              <Image style={styles.EditIcon} source={require('../images/edit_icon.png')} />
            </TouchableOpacity>
            <Text style={styles.tile1}>Địa chỉ:</Text>
            <Text>Hoàng triệu Tâm Nhân</Text>
            <Text>120 Quang Trung, P14, Quận Gò Vấp, TPHCM</Text>
            <Text>SĐT: +84-32842324</Text>
          </View>
          <TouchableOpacity style={styles.plusBox}>
            <Image source={require('../images/plus_icon.png')} />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{marginTop:30, marginBottom:10, fontSize:16, fontWeight:'bold'}}>
            Danh sách mua sắm
          </Text>
        </View>
        <View>
          {items.map(item => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={item.image} style={styles.productImage} />
              <View>
                <Text style={{ fontFamily: 'PlayfairDisplay', fontSize: 20 }}>{item.name}</Text>
                <Text>{item.Text}</Text>
                <Text>{item.price} vnđ</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.checkoutButton}onPress={() => navigation.navigate('PaymentSuccess')}>
          <Text style={styles.textButton}>Thanh Toán</Text>
        </TouchableOpacity>
      </ScrollView>


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

    </View >
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

  Address: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 0, gap: 15, borderRadius: 10, marginTop: 12 },
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
  iconGroup: { height: 20, width: 17, marginEnd: 10, marginLeft: 10, fontWeight: 100 },
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
  viewGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  backButton: { position: 'absolute', left: 15, padding: 10, marginStart: -10 },
  tileGroup: { fontSize: 20, fontWeight: '600', },
  tile: { fontSize: 20, fontWeight: '600', },
  tile1: { fontSize: 15, fontWeight: '500', },
  flex: { flexDirection: 'row', alignItems: 'center', position: 'relative', justifyContent: 'center' },
  container: { flex: 1, padding: 10, backgroundColor: '#F5F5F5' },
  Line: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  productImage: { width: 130, height: 125, marginRight: 10 },
  checkoutButton: { backgroundColor: '#ff69b4', padding: 15, alignItems: 'center', marginTop: 20, borderRadius: 10, width: 295, alignSelf: 'center' },
  textButton: { color: 'white', fontSize: 15, textAlign: 'center' },
});

export default CartScreen;