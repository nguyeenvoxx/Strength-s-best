import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const QRCodePaymentScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: 'path_to_qr_code_image' }} style={styles.qrCode} />
      <Text style={styles.logo}>VietQR PRO</Text>
      <Text style={styles.info}>napas 24/7 - MB</Text>
      <Text style={styles.title}>Thông báo</Text>
      <Text style={styles.details}>Ngân hàng TMCP Quân đội</Text>
      <Text style={styles.details}>Chi nhánh: Hà Nội Triều Tâm Nhan</Text>
      <Text style={styles.details}>Số tài khoản: VQKA93203131331</Text>
      <Text style={styles.details}>5.000đ</Text>
      <Text style={styles.note}>Chú ý: Đã có nợ</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Hủy</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrCode: { width: 200, height: 200, marginBottom: 20 },
  logo: { fontSize: 18, fontWeight: 'bold', color: '#ff0000', marginBottom: 10 },
  info: { fontSize: 14, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  details: { fontSize: 14, textAlign: 'center', marginBottom: 5 },
  note: { fontSize: 14, color: '#ff0000', marginBottom: 20 },
  button: { backgroundColor: '#00aaff', padding: 10, borderRadius: 5, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default QRCodePaymentScreen;