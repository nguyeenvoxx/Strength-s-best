import { create } from 'zustand';
import { API_CONFIG } from '../services/config';
import { useAuthStore } from './useAuthStore';

interface Voucher {
  _id: string;
  code: string;
  count: number;
  discount: number;
  expiryDate: string;
  description: string;
  status: string;
  pointsRequired: number;
  isExchangeable: boolean;
  conditions: {
    minOrderValue: number;
    userLimit?: number;
  };
}

interface VoucherStore {
  vouchers: Voucher[];
  selectedVoucher: Voucher | null;
  exchangeableVouchers: Voucher[];
  userPoints: number;
  totalSpent: number;
  reviewCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchVouchers: (token: string) => Promise<void>;
  selectVoucher: (voucher: Voucher | null) => void;
  fetchExchangeableVouchers: (token: string) => Promise<void>;
  fetchUserPoints: (token: string) => Promise<void>;
  exchangeVoucher: (voucherId: string) => Promise<void>;
  checkDailyLogin: (token: string) => Promise<void>;
  clearError: () => void;
}

export const useVoucherStore = create<VoucherStore>((set, get) => ({
  vouchers: [],
  selectedVoucher: null,
  exchangeableVouchers: [],
  userPoints: 0,
  totalSpent: 0,
  reviewCount: 0,
  isLoading: false,
  error: null,

  fetchVouchers: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('=== VOUCHER STORE: FETCH VOUCHERS REQUEST ===');

      const response = await fetch(`${API_CONFIG.BASE_URL}/vouchers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('=== VOUCHER STORE: FETCH VOUCHERS RESPONSE ===');
      console.log('Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Vouchers Data:', data);
        
        set({ 
          vouchers: data.data?.vouchers || [],
          isLoading: false 
        });
      } else {
        const errorData = await response.json();
        console.error('=== VOUCHER STORE: FETCH VOUCHERS ERROR ===');
        console.error('Status:', response.status);
        console.error('Error Data:', errorData);
        
        set({ 
          error: errorData.message || 'Không thể lấy danh sách voucher',
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('=== VOUCHER STORE: FETCH VOUCHERS ERROR ===');
      console.error('Error:', error);
      set({ 
        error: 'Không thể kết nối đến server',
        isLoading: false 
      });
    }
  },

  fetchExchangeableVouchers: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_CONFIG.BASE_URL}/vouchers/rewards/exchangeable`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        set({ 
          exchangeableVouchers: data.data?.vouchers || [],
          isLoading: false 
        });
      } else {
        const errorData = await response.json();
        set({ 
          error: errorData.message || 'Không thể lấy voucher có thể đổi',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Không thể kết nối đến server',
        isLoading: false 
      });
    }
  },

  fetchUserPoints: async (token: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(`${API_CONFIG.BASE_URL}/vouchers/rewards/points`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        set({ 
          userPoints: data.data?.points || 0,
          totalSpent: data.data?.totalSpent || 0,
          reviewCount: data.data?.reviewCount || 0,
          isLoading: false 
        });
      } else {
        const errorData = await response.json();
        set({ 
          error: errorData.message || 'Không thể lấy thông tin điểm',
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: 'Không thể kết nối đến server',
        isLoading: false 
      });
    }
  },

  exchangeVoucher: async (voucherId: string) => {
    try {
      set({ isLoading: true, error: null });
      // Lấy token từ auth store
      const { token } = useAuthStore.getState();
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/vouchers/rewards/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voucherId })
      });

      if (response.ok) {
        const data = await response.json();
        // Cập nhật lại thông tin điểm sau khi đổi voucher
        get().fetchUserPoints(token);
        get().fetchExchangeableVouchers(token);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể đổi voucher');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Không thể đổi voucher',
        isLoading: false 
      });
      throw error;
    }
  },

  checkDailyLogin: async (token: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/vouchers/rewards/daily-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Cập nhật lại thông tin điểm sau khi check daily login
        get().fetchUserPoints(token);
      }
    } catch (error) {
      console.error('Daily login check failed:', error);
    }
  },

  selectVoucher: (voucher: Voucher | null) => {
    set({ selectedVoucher: voucher });
  },

  clearError: () => {
    set({ error: null });
  }
})); 