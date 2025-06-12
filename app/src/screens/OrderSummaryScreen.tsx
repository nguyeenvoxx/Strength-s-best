import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderSummaryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.item}>Đặt hàng: 2.800.000 VND</Text>
      <Text style={styles.item}>Vận chuyển: 30.000 VND</Text>
      <Text style={styles.item}>Tổng cộng: 2.830.000 VND</Text>
      <Text style={styles.section}>Payment</Text>
      <View style={styles.paymentOption}>
        <Text>••••••••2109</Text>
      </View>
      <View style={styles.paymentOption}>
        <Text>••••••••2109</Text>
      </View>
      <View style={styles.paymentOption}>
        <Text>••••••••2109</Text>
      </View>
      <View style={styles.paymentOption}>
        <Text>••••••••2109</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Tiếp Tục</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { fontSize: 16, marginBottom: 10 },
  section: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  paymentOption: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, alignItems: 'center' },
  button: { backgroundColor: '#ff0000', padding: 15, borderRadius: 5, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default OrderSummaryScreen;