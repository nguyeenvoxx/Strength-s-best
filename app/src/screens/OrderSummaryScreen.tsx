import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  QRCodePayment: undefined;
  Home: undefined;
  Profile: undefined;
  Cart: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const paymentMethods = [
  { id: 'bank', icon: require('../images/Bank_icon.png'), last4: '2109' },
  { id: 'cash', icon: require('../images/Money_icon.png'), last4: '2109' },
  { id: 'mastercard', icon: require('../images/mastercard_icon.png'), last4: '2109' },
  { id: 'apple', icon: require('../images/IOS-Bank_icon.png'), last4: '2109' },
];

const OrderSummaryScreen: React.FC = () => {
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {/* Thông tin đơn hàng */}

        <View style={styles.row}>
          <Text style={styles.label}>Đặt hàng:</Text>
          <Text style={styles.item}>2.800.000 VND</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vận chuyển:</Text>
          <Text style={styles.item}>30.000 VND</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.labelAll}>Tổng cộng:</Text>
          <Text style={styles.itemAll}>2.830.000 VND</Text>
        </View>


        <Text style={styles.section}>Phương thức thanh toán</Text>

        <View style={{ padding: 16 }}>
    
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodBox,
                selectedMethodId === method.id && styles.methodBoxSelected,
              ]}
              onPress={() => setSelectedMethodId(method.id)}
            >
              <Image source={method.icon} style={styles.icon} />
              <Text style={styles.text}>•••• {method.last4}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('QRCodePayment')}>
          <Text style={styles.buttonText}>Tiếp Tục</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  methodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  methodBoxSelected: {
    borderColor: 'red',
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 12,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 16,
  },
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
  iconbank: {
    width: 30,
    height: 30,
    marginRight: 20,
  },
  iconMoney: {
    width: 40,
    height: 20,
    marginRight: 20,
  },
  textCar: {
    fontSize: 14,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 10
  },
  labelAll: {
    fontSize: 16,
    marginTop: 10
  },
  backButton: { position: 'absolute', left: 15, padding: 10, marginStart: -10 },
  container: { flex: 1, padding: 20 },
  item: {
    fontSize: 16,
    color: '#888'
  },
  itemAll: {
    fontSize: 16,
  },
  section: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  paymentOption: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  button: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default OrderSummaryScreen;