import { create } from 'zustand';
import { 
  getNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification as deleteNotificationApi,
  Notification,
  createNotification
} from '../services/notificationApi';

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
    payload: { title: string; message: string; type: Notification['type']; relatedId?: string; relatedModel?: string; icon?: string }
  ) => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (token: string, page: number = 1, limit: number = 20) => {
    set({ isLoading: true, error: null });
    try {
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
      console.error('Lỗi tải số thông báo chưa đọc:', error);
    }
  },

  refreshNotifications: async (token: string) => {
    try {
      const response = await getNotifications(token, 1, 20);
      set({ 
        notifications: response.data.notifications, 
        unreadCount: response.data.unreadCount 
      });
    } catch (error: any) {
      console.error('Lỗi refresh thông báo:', error);
    }
  },

  markAsRead: async (token: string, id: string) => {
    try {
      await markNotificationAsRead(token, id);
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification =>
        notification._id === id ? { ...notification, isRead: true } : notification
      );
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      set({ notifications: updatedNotifications, unreadCount });
    } catch (error: any) {
      set({ error: error.message || 'Không thể đánh dấu thông báo đã đọc' });
    }
  },

  markAllAsRead: async (token: string) => {
    try {
      await markAllNotificationsAsRead(token);
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => ({ 
        ...notification, 
        isRead: true 
      }));
      set({ notifications: updatedNotifications, unreadCount: 0 });
    } catch (error: any) {
      set({ error: error.message || 'Không thể đánh dấu tất cả thông báo đã đọc' });
    }
  },

  deleteNotification: async (token: string, id: string) => {
    try {
      await deleteNotificationApi(token, id);
      const { notifications } = get();
      const updatedNotifications = notifications.filter(notification => notification._id !== id);
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      set({ notifications: updatedNotifications, unreadCount });
    } catch (error: any) {
      set({ error: error.message || 'Không thể xóa thông báo' });
    }
  },

  create: async (token: string, payload) => {
    try {
      await createNotification(token, payload);
      // Refresh để thấy ngay
      const response = await getNotifications(token, 1, 20);
      set({ notifications: response.data.notifications, unreadCount: response.data.unreadCount });
    } catch (error: any) {
      set({ error: error.message || 'Không thể tạo thông báo' });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
