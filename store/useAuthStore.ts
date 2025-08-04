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
          
          set({
            user: response.data.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
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
        set({ token, isAuthenticated: true });
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
    }
  )
);