// services/paymentApi.ts
import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';

// Hàm tạo thanh toán VNPAY QR, trả về { paymentUrl: string }
export const createVnpayPayment = async (amount: number, orderId: string) => {
  const token = useAuthStore.getState().token;
  // Gửi POST request tới endpoint /payments/qr với amount và orderId
  const res = await axios.post(
    'http://172.19.16.1:3000/api/v1/vnpay/create',
    { amount, orderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  // API trả về { paymentUrl: string }
  return res.data;
};