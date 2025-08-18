import { create } from 'zustand';
import { getUserOrders } from '../services/orderApi';
import { getUserReviews } from '../services/reviewApi';
import { API_CONFIG } from '../constants/config';
import { useAuthStore } from './useAuthStore';

interface UserStats {
  orderCount: number;
  favoriteCount: number;
  reviewCount: number;
}

interface UserStatsStore {
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  fetchUserStats: (token: string) => Promise<void>;
  refreshStats: () => void;
  clearError: () => void;
}

export const useUserStatsStore = create<UserStatsStore>((set, get) => ({
  stats: {
    orderCount: 0,
    favoriteCount: 0,
    reviewCount: 0,
  },
  isLoading: false,
  error: null,

  fetchUserStats: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      // Lấy dữ liệu thực tế từ API
      const [ordersResponse, favoritesResponse, reviewsResponse] = await Promise.all([
        getUserOrders(token),
        fetch(`${API_CONFIG.BASE_URL}/favorites`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        getUserReviews(token, 1, 100)
      ]);

      // Xử lý dữ liệu đơn hàng
      const orderCount = ordersResponse.length;

      // Xử lý dữ liệu yêu thích
      let favoriteCount = 0;
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        favoriteCount = favoritesData.data?.favorites?.length || 0;
      }

      // Xử lý dữ liệu đánh giá
      const reviewCount = reviewsResponse.reviews?.length || 0;
      
      const realStats = {
        orderCount,
        favoriteCount,
        reviewCount,
      };
      
      set({ 
        stats: realStats, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      set({ 
        error: error.message || 'Không thể tải thống kê', 
        isLoading: false 
      });
    }
  },

  refreshStats: () => {
    // Refresh stats bằng cách gọi lại API
    const token = useAuthStore?.getState()?.token;
    if (token) {
      get().fetchUserStats(token);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
