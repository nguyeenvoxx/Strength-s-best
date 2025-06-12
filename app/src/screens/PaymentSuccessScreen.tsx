import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PaymentSuccessScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh Toán Với PayOS</Text>
      <Text style={styles.message}>Nhận ngay ưu đãi thanh toán</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Thanh toán ngay</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton}>
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