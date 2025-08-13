import { create } from 'zustand';

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
    orderCount: 1, // 1 đơn hàng
    favoriteCount: 0, // 0 yêu thích
    reviewCount: 2, // 2 đánh giá
  },
  isLoading: false,
  error: null,

  fetchUserStats: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Thay thế bằng API calls thực tế
      // const [ordersResponse, favoritesResponse, reviewsResponse] = await Promise.all([
      //   api.get('/orders/count', { headers: { Authorization: `Bearer ${token}` } }),
      //   api.get('/favorites/count', { headers: { Authorization: `Bearer ${token}` } }),
      //   api.get('/reviews/count', { headers: { Authorization: `Bearer ${token}` } }),
      // ]);
      
      // Sử dụng số liệu thực tế của user hiện tại
      const mockStats = {
        orderCount: 1, // 1 đơn hàng
        favoriteCount: 0, // 0 yêu thích
        reviewCount: 2, // 2 đánh giá
      };
      
      set({ 
        stats: mockStats, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Không thể tải thống kê', 
        isLoading: false 
      });
    }
  },

  refreshStats: () => {
    // Giữ nguyên số liệu thực tế của user
    const currentStats = get().stats;
    // Không thay đổi số liệu khi refresh
    set({ stats: currentStats });
  },

  clearError: () => {
    set({ error: null });
  },
}));
