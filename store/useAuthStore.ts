import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { LoginRequest, SignupRequest, VerifyEmailRequest, ResendVerificationRequest } from '../services/authApi';

interface User {
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
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: SignupRequest) => Promise<void>;
  verifyEmail: (email: string, verifyCode: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  checkEmailStatus: (email: string) => Promise<any>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);
          
          set({
            user: response.data.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      signup: async (userData: SignupRequest) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.signup(userData);
          
          // Kiểm tra nếu có token (đăng ký thành công)
          if (response.token) {
            set({
              user: response.data.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Trường hợp khác
            set({
              isLoading: false,
              error: null,
            });
          }
          
          return response; // Trả về response để frontend có thể xử lý
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      verifyEmail: async (email: string, verifyCode: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.verifyEmail({ email, verifyCode });
          
          set({
            user: response.data.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Xác thực email thất bại';
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      resendVerificationCode: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          await authService.resendVerificationCode({ email });
          
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Gửi lại mã xác thực thất bại';
          set({ 
            error: errorMessage, 
            isLoading: false
          });
          throw error;
        }
      },

      checkEmailStatus: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.checkEmailStatus({ email });
          
          set({
            isLoading: false,
            error: null,
          });
          
          return response;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Kiểm tra email thất bại';
          set({ 
            error: errorMessage, 
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        // Validate token trước khi set
        if (!token || typeof token !== 'string' || token.trim() === '') {
          console.warn('🔍 AuthStore - Invalid token provided:', token);
          set({ token: null, isAuthenticated: false });
          return;
        }
        
        const cleanToken = token.trim();
        console.log('🔍 AuthStore - Setting token, length:', cleanToken.length);
        set({ token: cleanToken, isAuthenticated: true });
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
        // Validate token sau khi load từ storage
        if (state && state.token) {
          if (typeof state.token !== 'string' || state.token.trim() === '') {
            console.warn('🔍 AuthStore - Invalid token from storage, clearing...');
            state.token = null;
            state.isAuthenticated = false;
          } else {
            console.log('🔍 AuthStore - Token loaded from storage, length:', state.token.length);
          }
        }
      },
    }
  )
);