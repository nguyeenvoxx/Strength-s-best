import axios from 'axios';
import { API_CONFIG } from './config';

const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface VerifyEmailRequest {
  email: string;
  verifyCode: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: {
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
    };
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi đăng nhập:', error.response?.data || error.message);
      throw error;
    }
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/auth/signup', userData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi đăng ký:', error.response?.data || error.message);
      throw error;
    }
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/auth/verify-email', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi xác thực email:', error.response?.data || error.message);
      throw error;
    }
  },

  resendVerificationCode: async (data: ResendVerificationRequest): Promise<any> => {
    try {
      const response = await authApi.post('/auth/resend-verification', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi gửi lại mã xác thực:', error.response?.data || error.message);
      throw error;
    }
  },

  // Validate token by making a simple authenticated request
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await authApi.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.status === 200;
    } catch (error: any) {
      return false;
    }
  },
};

export const updateProfile = async (token: string, data: { name?: string; email?: string; phoneNumber?: string; address?: string; avatarUrl?: string }) => {
  const res = await axios.patch(
    `${API_CONFIG.BASE_URL}/users/profile`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const uploadAvatar = async (token: string, imageUri: string) => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'avatar.jpg'
  } as any);

  const res = await axios.post(
    `${API_CONFIG.BASE_URL}/users/upload-avatar`,
    formData,
    { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      } 
    }
  );
  return res.data;
};

export const changePassword = async (token: string, currentPassword: string, newPassword: string) => {
  const res = await axios.post(
    `${API_CONFIG.BASE_URL}/users/change-password`, 
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export default authService;