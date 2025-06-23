import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { bankCodeMap } from '../app/utils/bankCodeMap';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';



type QrData = {
  qrUrl: string;
  accountName: string;
  accountNo: string;
  amount: number;
  content: string;
  bankId: string;
};



const QRCodePaymentScreen: React.FC = () => {
  const router = useRouter();

  const getBankLogo = (bankId: string) => {

    switch (bankId?.toLowerCase()) {
      case 'mb':
        return require('../assets/images/mb-bank-logo.png');
      case 'vcb':
        return require('../assets/images/Vietcombank-logo.png');
      case 'tcb':
        return require('../assets/images/Techcombank-logo.png');
      default:
        return require('../assets/images/Bank_icon.png'); // logo mặc định nếu không tìm thấy
    }

  };
  const API_URL = 'https://quoctuanqrdev.loca.lt/api/qr'; const [visible, setVisible] = useState(false)
  const [qrData, setQrData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60); // đếm ngược 5 phút


  const fetchQR = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}?amount=5000&orderId=DH123`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(' API trả về lỗi:', errorText);
        throw new Error('API không trả về JSON hợp lệ');
      }
      const data: QrData = await res.json();

      if (!data.qrUrl || !data.accountName || !data.accountNo) {
        console.error(' Dữ liệu thiếu trường bắt buộc:', data);
        throw new Error('Thiếu dữ liệu QR');
      }



      setQrData(data);
      setTimeLeft(60);
    } catch (e) {
      console.error('Lỗi khi gọi API:', e);
      setQrData(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQR(); // gọi lần đầu
    const refresh = setInterval(fetchQR, 1 * 60 * 1000); // lặp lại sau 1 phút
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const { selected, voucher } = useLocalSearchParams();
  const selectedItems = selected ? JSON.parse(selected as string) : [];
  const selectedVoucher = voucher ? JSON.parse(voucher as string) : null;
  const shippingFee = 30000;

  const orderTotal = selectedItems.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );

  const discount = selectedVoucher && orderTotal >= selectedVoucher.minOrder
    ? Math.min((orderTotal * selectedVoucher.discountPercent) / 100, selectedVoucher.maxDiscount)
    : 0;

  const finalTotal = orderTotal + shippingFee - discount;

  const handlePaymentSuccess = async () => {
    setVisible(false);

    try {
      const newOrder = {
        id: 'ODR-' + Date.now(),
        items: selectedItems,
        total: finalTotal,
        discount,
        voucher: selectedVoucher,
        shippingFee: 30000,
        date: new Date().toISOString(),
      };
      console.log('selectedItems:', selectedItems);

      // Lấy đơn hàng đã mua cũ
      const existing = await AsyncStorage.getItem('purchased');
      const purchased = existing ? JSON.parse(existing) : [];

      // Gộp sản phẩm mới thanh toán vào danh sách đã mua
      const updatedPurchased = [...purchased, newOrder];
      await AsyncStorage.setItem('purchased', JSON.stringify(updatedPurchased));

      // (Tuỳ chọn) Xoá các sản phẩm đã mua khỏi giỏ hàng
      const cart = await AsyncStorage.getItem('cart');
      if (cart) {
        const cartItems = JSON.parse(cart);
        const newCart = cartItems.filter(
          (item: any) => !selectedItems.find((sel: any) => sel.id === item.id)
        );
        await AsyncStorage.setItem('cart', JSON.stringify(newCart));
      }

      // Chuyển qua màn order summary
      router.push({
        pathname: './order-summary',
        params: { selected: JSON.stringify(selectedItems) },
      });
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
    }
  };
  const handleCancel = () => {
    router.push('./(tabs)/cart');
  };

  return (
    <View style={styles.container}>
      {loading && <Text>Đang tải mã QR...</Text>}
      {!loading && !qrData && (
        <Text style={{ color: 'red' }}>
          Không thể tải mã QR. Vui lòng thử lại sau.
        </Text>
      )}
      {qrData && (
        <>
          {qrData.qrUrl && (
            <Image source={{ uri: qrData.qrUrl }} style={styles.qrCode} />
          )}
          {qrData && (
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
              Còn lại: {Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Text>
          )}
          <Text style={styles.title}>Thông báo</Text>

          <View style={styles.stylesBankinf}>
            <View style={styles.bankInf}>
              <Image
                source={getBankLogo(qrData.bankId)}
                style={styles.logoBankinfo}
              />
              <Text style={styles.details}>
                {bankCodeMap[qrData.bankId] || `Ngân hàng ${qrData.bankId}`}
              </Text>
            </View>
            <Text style={styles.details}>{qrData?.accountName}</Text>
            <Text style={styles.details}>{qrData?.accountNo}</Text>
            <Text style={styles.details}>{qrData?.amount}đ</Text>
            <Text style={styles.details}>{qrData?.content}</Text>
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
        </>

      )}
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
    width: 230,
    height: 280,
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
    backgroundColor: '#469B43',
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
