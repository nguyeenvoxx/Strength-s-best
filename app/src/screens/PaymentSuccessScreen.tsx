import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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



const PaymentSuccessScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh Toán Với PayOS</Text>
      <Text style={styles.message}>Nhận ngay ưu đãi thanh toán</Text>
      <TouchableOpacity style={styles.button}onPress={() => navigation.navigate('OrderSummary')}>
        <Text style={styles.buttonText}>Thanh toán ngay</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton}onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.cancelButtonText}>Quay Lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#00aaff', padding: 10, borderRadius: 5, width: '80%', alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16 },
  cancelButton: { backgroundColor: '#ff0000', padding: 10, borderRadius: 5, width: '80%', alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontSize: 16 },
});

export default PaymentSuccessScreen;