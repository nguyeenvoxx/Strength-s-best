import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { getPlatformContainerStyle } from '../utils/platformUtils';

const QRCodePaymentScreen: React.FC = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const handlePaymentSuccess = () => {
    setVisible(false);
    router.push('./payment-success');
  };

  const handleCancel = () => {
    router.push('./(tabs)/cart');
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <Image source={require('../assets/images/QRcode.png')} style={styles.qrCode} />
      <Text style={styles.title}>Thông báo</Text>
      <View style={styles.stylesBankinf}>
        <View style={styles.bankInf}>
          <Image source={require('../assets/images/mb-bank-logo.png')} style={styles.logoBankinfo} />
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
        <TouchableOpacity style={styles.button} onPress={handleCancel}>
          <Text style={styles.buttonText}>Hủy</Text>
        </TouchableOpacity>

        <Modal
          visible={visible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Image source={require('../assets/images/Payment_icon.png')} style={{ alignItems: 'center', marginRight: 25 }} />
              <Text style={styles.modalText}>Thanh toán thành công!</Text>
              <TouchableOpacity
                onPress={handlePaymentSuccess}
                style={styles.closeButton}
              >
                <Text style={styles.buttonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  qrCode: { 
    width: 200, 
    height: 230, 
    marginBottom: 20 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#333'
  },
  stylesBankinf: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    width: '100%'
  },
  bankInf: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBankinfo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
    borderRadius: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10
  },
  details: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: 'white', 
    padding: 30, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16, 
    marginBottom: 20,
    color: '#333'
  },
  closeButton: {
    backgroundColor: '#28a745', 
    padding: 10, 
    borderRadius: 8,
  },
});

export default QRCodePaymentScreen;
