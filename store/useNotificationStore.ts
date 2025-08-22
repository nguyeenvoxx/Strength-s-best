import { create } from 'zustand';
import { 
  getNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification as deleteNotificationApi,
  Notification,
  createNotification,
  createReviewResponseNotification,
  createOrderStatusNotification
} from '../services/notificationApi';
import { handleTokenExpired } from '../services/api';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (token: string, page?: number, limit?: number) => Promise<void>;
  fetchUnreadCount: (token: string) => Promise<void>;
  refreshNotifications: (token: string) => Promise<void>;
  markAsRead: (token: string, id: string) => Promise<void>;
  markAllAsRead: (token: string) => Promise<void>;
  deleteNotification: (token: string, id: string) => Promise<void>;
  create: (
    token: string,
    payload: { 
      title: string; 
      message: string; 
      type: Notification['type']; 
      relatedId?: string; 
      relatedModel?: string; 
      icon?: string;
      navigation?: Notification['navigation'];
    }
  ) => Promise<void>;
  createReviewResponse: (
    token: string,
    payload: {
      reviewId: string;
      productId: string;
      productName: string;
      adminResponse: string;
      userId: string;
    }
  ) => Promise<void>;
  createOrderStatusUpdate: (
    token: string,
    payload: {
      orderId: string;
      userId: string;
      oldStatus: string;
      newStatus: string;
    }
  ) => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (token: string, page = 1, limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getNotifications(token, page, limit);
      set({ 
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Không thể tải thông báo',
        isLoading: false 
      });
    }
  },

  fetchUnreadCount: async (token: string) => {
    try {
      const response = await getUnreadCount(token);
      set({ unreadCount: response.data.unreadCount });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      
      // Xử lý token expired nếu có
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage?.includes('hết hạn') || errorMessage?.includes('TOKEN_EXPIRED')) {
          handleTokenExpired({ message: errorMessage });
        }
      }
      
      // Không hiển thị lỗi cho user, chỉ log để debug
    }
  },

  refreshNotifications: async (token: string) => {
    await get().fetchNotifications(token, 1, 20);
  },

  markAsRead: async (token: string, id: string) => {
    try {
      await markNotificationAsRead(token, id);
      // Cập nhật local state
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification._id === id ? { ...notification, isRead: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error: any) {
      set({ error: error.message || 'Không thể đánh dấu thông báo đã đọc' });
    }
  },

  markAllAsRead: async (token: string) => {
    try {
      await markAllNotificationsAsRead(token);
      // Cập nhật local state
      set(state => ({
        notifications: state.notifications.map(notification => ({ ...notification, isRead: true })),
        unreadCount: 0
      }));
    } catch (error: any) {
      set({ error: error.message || 'Không thể đánh dấu tất cả thông báo đã đọc' });
    }
  },

  deleteNotification: async (token: string, id: string) => {
    try {
      await deleteNotificationApi(token, id);
      // Cập nhật local state
      set(state => {
        const notification = state.notifications.find(n => n._id === id);
        const wasUnread = notification && !notification.isRead;
        return {
          notifications: state.notifications.filter(notification => notification._id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa thông báo' });
    }
  },

  create: async (token: string, payload) => {
    try {
      await createNotification(token, payload);
      // Refresh notifications after creating new one
      await get().refreshNotifications(token);
    } catch (error: any) {
      set({ error: error.message || 'Không thể tạo thông báo' });
    }
  },

  createReviewResponse: async (token: string, payload) => {
    try {
      await createReviewResponseNotification(token, payload);
    } catch (error: any) {
      set({ error: error.message || 'Không thể tạo thông báo phản hồi đánh giá' });
    }
  },

  createOrderStatusUpdate: async (token: string, payload) => {
    try {
      await createOrderStatusNotification(token, payload);
    } catch (error: any) {
      set({ error: error.message || 'Không thể tạo thông báo cập nhật trạng thái đơn hàng' });
    }
  },

  clearError: () => set({ error: null }),
}));
