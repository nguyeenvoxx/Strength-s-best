import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Interface cho Product từ API
export interface ApiProduct {
  _id: string;
  nameProduct: string;
  priceProduct: number;
  quantity: number;
  image: string;
  status: 'active' | 'inactive' | 'available';
  idBrand: string | {
    _id: string;
    nameBrand: string;
  };
  idCategory: string | {
    _id: string;
    nameCategory: string;
  };
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho response từ API
export interface ApiResponse<T> {
  status: string;
  message?: string;
  results?: number;
  data: T;
}

// Interface cho Voucher từ API
export interface ApiVoucher {
  _id: string;
  code: string;
  discount: number;
  description: string;
  count: number;
  expiryDate: string;
  created_at: string;
  updated_at: string;
}

// Product API services
export const productApi = {
  // Lấy tất cả sản phẩm
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    sort?: string;
    fields?: string;
    [key: string]: any;
  }): Promise<ApiResponse<{ products: ApiProduct[] }>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Lấy sản phẩm theo ID
  getProduct: async (id: string): Promise<ApiResponse<{ product: ApiProduct }>> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Tạo sản phẩm mới (admin)
  createProduct: async (productData: {
    nameProduct: string;
    priceProduct: number;
    quantity: number;
    image: string;
    status: string;
    idBrand: string;
    idCategory: string;
    description?: string;
  }): Promise<ApiResponse<{ product: ApiProduct }>> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (
    id: string,
    productData: Partial<{
      nameProduct: string;
      priceProduct: number;
      quantity: number;
      image: string;
      status: string;
      idBrand: string;
      idCategory: string;
      description: string;
    }>
  ): Promise<ApiResponse<{ product: ApiProduct }>> => {
    const response = await api.patch(`/products/${id}`, productData);
    return response.data;
  },

  // Xóa sản phẩm (admin)
  deleteProduct: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Voucher API services
export const voucherApi = {
  // Lấy tất cả voucher
  getVouchers: async (): Promise<ApiResponse<{ vouchers: ApiVoucher[] }>> => {
    const response = await api.get('/vouchers');
    return response.data;
  },
};

export default api;