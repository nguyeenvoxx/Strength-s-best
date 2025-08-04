// services/paymentApi.ts
import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';

// Hàm tạo đơn hàng từ giỏ hàng
export const createOrderFromCart = async (items: any[], shippingInfo: any, voucherCode?: string) => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Creating order from cart:', { itemsCount: items.length, shippingInfo });

    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/api/v1/payments/create-order`,
      { 
        items, 
        shippingInfo, 
        voucherCode 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Order created successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi tạo đơn hàng');
  }
};

// Hàm tạo thanh toán VNPay QR
export const createVnpayPayment = async (amount: number, orderId: string, orderInfo?: string) => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Creating VNPay payment:', { amount, orderId });

    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/api/v1/payments/vnpay`,
      { 
        amount, 
        orderId, 
        orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}` 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ VNPay payment created successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating VNPay payment:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi tạo thanh toán VNPay');
  }
};

// Hàm tạo thanh toán MoMo QR
export const createMomoPayment = async (amount: number, orderId: string, orderInfo?: string) => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Creating MoMo payment:', { amount, orderId });

    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/api/v1/payments/momo`,
      { 
        amount, 
        orderId, 
        orderInfo: orderInfo || `Thanh toán đơn hàng #${orderId}` 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ MoMo payment created successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating MoMo payment:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi tạo thanh toán MoMo');
  }
};

// Hàm tạo thanh toán từ giỏ hàng
export const createPaymentFromCart = async (typePayment: 'vnpay' | 'momo' | 'cod', items: any[], shippingInfo: any, voucherCode?: string) => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Creating payment from cart:', { typePayment, itemsCount: items.length });

    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/api/v1/payments/from-cart`,
      { 
        typePayment, 
        items, 
        shippingInfo, 
        voucherCode 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Payment from cart created successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating payment from cart:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi tạo thanh toán từ giỏ hàng');
  }
};

// Hàm lấy thông tin thanh toán
export const getPaymentInfo = async (paymentId: string) => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Getting payment info:', paymentId);

    const res = await axios.get(
      `${API_CONFIG.BASE_URL}/api/v1/payments/detail/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Payment info retrieved successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting payment info:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi lấy thông tin thanh toán');
  }
};

// Hàm lấy danh sách thanh toán của user
export const getMyPayments = async () => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Getting my payments');

    const res = await axios.get(
      `${API_CONFIG.BASE_URL}/api/v1/payments/my-payments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ My payments retrieved successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error getting my payments:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi lấy danh sách thanh toán');
  }
};

// Hàm xóa tất cả sản phẩm khỏi giỏ hàng
export const clearCartItems = async () => {
  const token = useAuthStore.getState().token;
  
  if (!token) {
    throw new Error('Token không tồn tại');
  }

  try {
    console.log('🔍 Clearing cart items');

    const res = await axios.delete(
      `${API_CONFIG.BASE_URL}/api/v1/carts/clear`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ Cart cleared successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error clearing cart:', error);
    throw new Error(error?.response?.data?.message || 'Lỗi xóa giỏ hàng');
  }
};