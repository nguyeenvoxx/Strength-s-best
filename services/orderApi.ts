import { API_CONFIG } from './config';
import { handleTokenExpired } from './api';

export interface OrderItem {
  productId: string | any; // Có thể là string hoặc object
  idProduct?: any; // Backend có thể trả về idProduct
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  voucherId?: string;
  userVoucherId?: string;
  voucherDiscount?: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  totalPrice?: number; // Backend có thể trả về totalPrice
  totalQuantity?: number; // Backend có thể trả về totalQuantity
  paymentMethod: string;
  status: string;
  voucherId?: string;
  voucherDiscount?: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    province: string;
    district: string;
    ward: string;
  };
  createdAt: string;
  updatedAt: string;
  created_at?: string; // Backend có thể trả về created_at
  updated_at?: string; // Backend có thể trả về updated_at
}

export const createOrder = async (token: string, orderData: CreateOrderRequest): Promise<Order> => {
  try {
    console.log('=== ORDER API: CREATE ORDER REQUEST ===');
    console.log('Order Data:', orderData);

    const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    console.log('=== ORDER API: CREATE ORDER RESPONSE ===');
    console.log('Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Create Order Response:', data);
      return data.data?.order;
    } else {
      const errorData = await response.json();
      console.error('Create Order Error:', errorData);
      throw new Error(errorData.message || 'Không thể tạo đơn hàng');
    }
  } catch (error) {
    console.error('=== ORDER API: CREATE ORDER ERROR ===');
    console.error('Error:', error);
    throw error;
  }
};

export const getUserOrders = async (token: string): Promise<Order[]> => {
  try {
    console.log('=== ORDER API: GET USER ORDERS REQUEST ===');

    const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('=== ORDER API: GET USER ORDERS RESPONSE ===');
    console.log('Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Get User Orders Response:', data);
      return data.data?.orders || [];
    } else {
      const errorData = await response.json();
      console.error('Get User Orders Error:', errorData);
      
      // Xử lý token expired
      if (response.status === 401 && handleTokenExpired(errorData)) {
        return [];
      }
      
      // Không throw error để tránh hiển thị lỗi kỹ thuật cho user
      return [];
    }
  } catch (error) {
    console.error('=== ORDER API: GET USER ORDERS ERROR ===');
    console.error('Error:', error);
    
    // Xử lý token expired nếu có
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as any).message;
      if (errorMessage?.includes('hết hạn') || errorMessage?.includes('TOKEN_EXPIRED')) {
        handleTokenExpired({ message: errorMessage });
      }
    }
    
    // Không throw error để tránh hiển thị lỗi kỹ thuật cho user
    return [];
  }
};

export const getOrderDetail = async (token: string, orderId: string): Promise<any> => {
  try {
    console.log('=== ORDER API: GET ORDER DETAIL REQUEST ===');
    console.log('Order ID:', orderId);
    console.log('API URL:', `${API_CONFIG.BASE_URL}/orders/${orderId}/detail`);

    const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response headers:', response.headers);

    console.log('=== ORDER API: GET ORDER DETAIL RESPONSE ===');
    console.log('Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Get Order Detail Response:', data);
      console.log('Response data structure:', {
        hasData: !!data.data,
        hasOrder: !!(data.data && data.data.order),
        dataKeys: Object.keys(data)
      });
      
      // Kiểm tra cả hai cấu trúc response có thể có
      const orderData = data.data?.order || data.order;
      if (!orderData) {
        console.error('❌ No order data in response');
        console.error('Available data keys:', Object.keys(data));
        throw new Error('Không tìm thấy dữ liệu đơn hàng');
      }
      
      console.log('✅ Order data found:', {
        id: orderData._id,
        status: orderData.status,
        totalAmount: orderData.totalAmount,
        itemsCount: orderData.items?.length || 0
      });
      
      return orderData;
    } else {
      const errorData = await response.json();
      console.error('Get Order Detail Error:', errorData);
      throw new Error(errorData.message || 'Không thể lấy chi tiết đơn hàng');
    }
  } catch (error) {
    console.error('=== ORDER API: GET ORDER DETAIL ERROR ===');
    console.error('Error:', error);
    throw error;
  }
}; 