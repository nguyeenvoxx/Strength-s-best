import axios from 'axios';
import { API_CONFIG } from '../constants/config';

const authApi = axios.create({
  baseURL: API_CONFIG.AUTH_URL,
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
    const response = await authApi.post('/login', credentials);
    return response.data;
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await authApi.post('/signup', userData);
    return response.data;
  },

  // Validate token by making a simple authenticated request
  validateToken: async (token: string): Promise<boolean> => {
    try {
      console.log('🌐 Making request to /me endpoint for token validation...');
      const response = await authApi.get('/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ /me endpoint response:', {
        status: response.status,
        data: response.data ? 'EXISTS' : 'NULL'
      });
      return response.status === 200;
    } catch (error: any) {
      console.log('❌ /me endpoint failed:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url
      });
      return false;
    }
  },
};

export default authService;