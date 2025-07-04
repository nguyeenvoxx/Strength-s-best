import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { LoginRequest, SignupRequest } from '../services/authApi';

export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  status: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  validateStoredToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);
          
          console.log('🔐 Login successful, setting auth state...', {
            user: response.data.user.email,
            token: response.token ? 'EXISTS' : 'NULL'
          });
          
          set({
            user: response.data.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          console.log('✅ Auth state updated after login');
        } catch (error: any) {
          console.log('❌ Login failed:', error.response?.data?.message);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Đăng nhập thất bại',
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      signup: async (userData: SignupRequest) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.signup(userData);
          
          set({
            user: response.data.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Auth store signup error:', error);
          let errorMessage = 'Đăng ký thất bại';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            if (error.message.includes('Network Error')) {
              errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
            } else if (error.message.includes('timeout')) {
              errorMessage = 'Kết nối bị timeout. Vui lòng thử lại.';
            } else {
              errorMessage = error.message;
            }
          }
          
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        console.log('🚪 Logging out user...');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        
        try {
          const { useSettingStore } = require('./useSettingStore');
          useSettingStore.getState().setIsFirstTime(true);
          console.log('✅ Logout complete, isFirstTime reset');
        } catch (error) {
          console.warn('Could not reset isFirstTime:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },

      validateStoredToken: async () => {
        const { token, isAuthenticated } = get();
        
        console.log('🔐 Starting token validation...', {
          hasToken: !!token,
          isAuthenticated
        });
        
        if (!token || !isAuthenticated) {
          console.log('❌ No token or not authenticated, skipping validation');
          return;
        }

        try {
          console.log('📡 Calling authService.validateToken...');
          const isValid = await authService.validateToken(token);
          console.log('📋 Token validation response:', isValid);
          
          if (!isValid) {
            console.log('❌ Token invalid, logging out user...');
            // Token không hợp lệ, logout user
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
            
            // Reset isFirstTime để hiển thị splash screen
            try {
              const { useSettingStore } = require('./useSettingStore');
              useSettingStore.getState().setIsFirstTime(true);
              console.log('🔄 isFirstTime reset to true due to invalid token');
            } catch (error) {
              console.warn('Could not reset isFirstTime:', error);
            }
          } else {
            console.log('✅ Token is valid, user remains authenticated');
          }
        } catch (error) {
          console.error('💥 Error validating token:', error);
          // Nếu có lỗi khi validate, logout để an toàn
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          
          // Reset isFirstTime để hiển thị splash screen
          try {
            const { useSettingStore } = require('./useSettingStore');
            useSettingStore.getState().setIsFirstTime(true);
            console.log('🔄 isFirstTime reset to true due to validation error');
          } catch (error) {
            console.warn('Could not reset isFirstTime:', error);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth store rehydrating...', {
          user: state?.user,
          token: state?.token ? 'EXISTS' : 'NULL',
          isAuthenticated: state?.isAuthenticated
        });
        state?.setHasHydrated(true);
        console.log('✅ Auth store hydrated');
      },
    }
  )
);