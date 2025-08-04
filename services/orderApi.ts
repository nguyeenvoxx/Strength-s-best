import { API_CONFIG } from '../constants/config';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
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
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
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
      throw new Error(errorData.message || 'Không thể lấy danh sách đơn hàng');
    }
  } catch (error) {
    console.error('=== ORDER API: GET USER ORDERS ERROR ===');
    console.error('Error:', error);
    throw error;
  }
}; 