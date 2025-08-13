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
  addressDetails?: {
    fullName: string;
    phone: string;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
  };
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
      role: string;
      status: string;
      avatarUrl?: string;
      emailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    address?: {
      _id: string;
      name: string;
      phone: string;
      address: string;
      province: string;
      district: string;
      ward: string;
      isDefault: boolean;
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
  try {
    console.log('🔄 Preparing to upload avatar:', imageUri);
    
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg'
    } as any);

    console.log('🔄 Sending upload request...');
    const res = await axios.post(
      `${API_CONFIG.BASE_URL}/users/upload-avatar`,
      formData,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );
    
    console.log('✅ Upload response:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Upload avatar error:', error);
    
    if (error.response) {
      // Server trả về lỗi
      console.error('❌ Server error:', error.response.data);
      throw new Error(error.response.data.message || 'Lỗi server khi upload ảnh');
    } else if (error.request) {
      // Không nhận được response
      console.error('❌ Network error:', error.request);
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra internet.');
    } else {
      // Lỗi khác
      console.error('❌ Other error:', error.message);
      throw new Error(error.message || 'Lỗi không xác định khi upload ảnh');
    }
  }
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