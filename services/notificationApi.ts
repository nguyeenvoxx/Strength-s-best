import { API_CONFIG } from './config';

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'news' | 'voucher' | 'product' | 'review';
  isRead: boolean;
  relatedId?: string;
  relatedModel?: string;
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
    limit: limit.toString()
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
    throw new Error(errorData.message || 'Không thể tải thông báo');
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
    throw new Error(errorData.message || 'Không thể tải số thông báo chưa đọc');
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
