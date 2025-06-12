import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type RootStackParamList = {
  QRCodePayment: undefined;
  Home: undefined;
  Profile: undefined;
  Cart: undefined;
  OrderSummary: undefined;
  PaymentSuccess: undefined;
}

const QRCodePaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.container}>
      {/* <Image source={{ uri: ''}} style={styles.qrCode} /> */}
      <Image source={require('../images/QRcode.png')} style={styles.qrCode} />
      <Text style={styles.title}>Thông báo</Text>
      <View style={styles.stylesBankinf}>
        <View style={styles.bankInf}>
          <Image source={require('../images/mb-bank-logo.png')} style={styles.logoBankinfo} />
          <Text style={styles.details}>Ngân hàng TMCP Quân đội</Text>
        </View>

        <Text style={styles.label}>Chủ tài khoản:</Text>
        <Text style={styles.details}>Triều Tâm Nhan</Text>

        <Text style={styles.label}>Số tài khoản:</Text>
        <Text style={styles.details}>VQKA93203131331</Text>

        <Text style={styles.label}>Số tiền:</Text>
        <Text style={styles.details}>5.000đ</Text>

        <Text style={styles.label}>Nội dung chuyển khoản:</Text>
        <Text style={styles.details}>Trieu Tam nhan chuyen tien</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setVisible(true)}>
          <Text style={styles.buttonText}>Thanh Toán</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cart')} >
          <Text style={styles.buttonText}>Hủy</Text>
        </TouchableOpacity>

        <Modal
          visible={visible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Image source={require('../images/Payment_icon.png')} style={{ alignItems: 'center', marginRight: 25 }} />
              <Text style={styles.modalText}>Thanh toán thành công!</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.buttonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  closeButton: {
    backgroundColor: 'red', padding: 10, borderRadius: 8,

  },
  modalText: {
    fontSize: 16, marginBottom: 20,
  },
  modalBox: {
    backgroundColor: 'white', padding: 30, borderRadius: 10, alignItems: 'center',

  },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10
  },
  logoBankinfo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
    borderRadius: 20,
  },
  bankInf: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stylesBankinf: {
    backgroundColor: '#fff',
    padding: 20,
  },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrCode: { width: 200, height: 230, marginBottom: 20 },
  logo: { fontSize: 18, fontWeight: 'bold', color: '#ff0000', marginBottom: 10 },
  info: { fontSize: 14, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  details: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  button: {
    backgroundColor: '#ff4040',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
});

export default QRCodePaymentScreen;