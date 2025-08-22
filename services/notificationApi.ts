import { API_CONFIG } from './config';
import { handleTokenExpired } from './api';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'news' | 'voucher' | 'product' | 'review';
  isRead: boolean;
  relatedId?: string;
  relatedModel?: string;
  navigation?: {
    route: 'order-detail' | 'product-detail' | 'news-detail' | 'voucher-list' | 'review-list' | 'purchased-orders' | 'profile' | 'home';
    params: Record<string, string>;
  };
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  status: string;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

export interface UnreadCountResponse {
  status: string;
  data: {
    unreadCount: number;
  };
}

// Lấy danh sách thông báo
export const getNotifications = async (
  token: string,
  page: number = 1,
  limit: number = 20,
  type?: string
): Promise<NotificationResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (type) {
    params.append('type', type);
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching notifications:', errorData);
    
    // Xử lý token expired
    if (response.status === 401 && handleTokenExpired(errorData)) {
      return { 
        status: 'thành công', 
        data: { 
          notifications: [], 
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
          unreadCount: 0 
        } 
      };
    }
    
    // Không throw error để tránh hiển thị lỗi kỹ thuật cho user
    return { 
      status: 'thành công', 
      data: { 
        notifications: [], 
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        unreadCount: 0 
      } 
    };
  }

  return response.json();
};

// Lấy số thông báo chưa đọc
export const getUnreadCount = async (token: string): Promise<UnreadCountResponse> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/unread-count`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error fetching unread count:', errorData);
    
    // Xử lý token expired
    if (response.status === 401 && handleTokenExpired(errorData)) {
      return { status: 'thành công', data: { unreadCount: 0 } };
    }
    
    // Không throw error để tránh hiển thị lỗi kỹ thuật cho user
    return { status: 'thành công', data: { unreadCount: 0 } };
  }

  return response.json();
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (token: string, notificationId: string): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể đánh dấu thông báo đã đọc');
  }

  return response.json();
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (token: string): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể đánh dấu tất cả thông báo đã đọc');
  }

  return response.json();
};

// Xóa thông báo
export const deleteNotification = async (token: string, notificationId: string): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể xóa thông báo');
  }

  return response.json();
};

// Tạo thông báo mới
export const createNotification = async (
  token: string,
  payload: {
    title: string;
    message: string;
    type: 'order' | 'promotion' | 'system' | 'news' | 'voucher' | 'product' | 'review';
    relatedId?: string;
    relatedModel?: string;
    icon?: string;
    navigation?: {
      route: 'order-detail' | 'product-detail' | 'news-detail' | 'voucher-list' | 'review-list' | 'purchased-orders' | 'profile' | 'home';
      params: Record<string, string>;
    };
  }
): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể tạo thông báo');
  }

  return response.json();
};

// Tạo thông báo phản hồi đánh giá (cho admin)
export const createReviewResponseNotification = async (
  token: string,
  payload: {
    reviewId: string;
    productId: string;
    productName: string;
    adminResponse: string;
    userId: string;
  }
): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/review-response`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể tạo thông báo phản hồi đánh giá');
  }

  return response.json();
};

// Tạo thông báo cập nhật trạng thái đơn hàng (cho admin)
export const createOrderStatusNotification = async (
  token: string,
  payload: {
    orderId: string;
    userId: string;
    oldStatus: string;
    newStatus: string;
  }
): Promise<any> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/order-status`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể tạo thông báo cập nhật trạng thái đơn hàng');
  }

  return response.json();
};
