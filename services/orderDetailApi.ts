import { API_CONFIG } from './config';

export interface OrderDetailItem {
  _id: string;
  productId: any;
  quantity: number;
  price: number;
  total: number;
  name: string;
}

export interface OrderDetail {
  _id: string;
  userId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  totalQuantity: number;
  paymentMethod: string;
  voucherId?: string;
  voucherDiscount?: number;
  items: OrderDetailItem[];
  shippingAddress: {
    name?: string;
    phone: string;
    address: string;
    fullName?: string;
  };
  payment?: {
    _id: string;
    amount: number;
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Lấy chi tiết đơn hàng theo ID
export const getOrderDetailById = async (token: string, orderId: string): Promise<OrderDetail> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/order-details/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.order;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy chi tiết đơn hàng');
    }
  } catch (error) {
    console.error('Order Detail API Error:', error);
    throw error;
  }
};

// Lấy danh sách order details theo order ID
export const getOrderDetailsByOrderId = async (token: string, orderId: string): Promise<OrderDetailItem[]> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/order-details/${orderId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.orderDetails;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy danh sách chi tiết đơn hàng');
    }
  } catch (error) {
    console.error('Order Details API Error:', error);
    throw error;
  }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (token: string, orderId: string, status: UpdateOrderStatusRequest['status']): Promise<OrderDetail> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/order-details/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.order;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  } catch (error) {
    console.error('Update Order Status API Error:', error);
    throw error;
  }
};

// Hủy đơn hàng
export const cancelOrder = async (token: string, orderId: string): Promise<OrderDetail> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/order-details/${orderId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data.order;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể hủy đơn hàng');
    }
  } catch (error) {
    console.error('Cancel Order API Error:', error);
    throw error;
  }
};


