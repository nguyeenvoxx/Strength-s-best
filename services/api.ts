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
    console.log('🔍 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      timeout: config.timeout
    });
    
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data ? 'Data received' : 'No data'
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      response: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Interface cho Category từ API
export interface ApiCategory {
  _id: string;
  nameCategory: string;
  created_at: string;
  updated_at: string;
}

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
  detail?: string;
  discount?: number; // Thêm trường discount
  // Thông tin chi tiết sản phẩm
  ingredients?: string;
  dosage?: string;
  benefits?: string[];
  warnings?: string[];
  storage?: string;
  expiry?: string;
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
  status: string;
  pointsRequired: number;
  isExchangeable: boolean;
  conditions?: {
    minOrderValue?: number;
    userLimit?: number;
  };
  created_at: string;
  updated_at: string;
}

// Products API
export const getProducts = async (params: { 
  page?: number; 
  limit?: number; 
  category?: string; 
  brand?: string; 
  search?: string;
  sort?: string;
} = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.brand) queryParams.append('brand', params.brand);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await api.get(`/products?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Related products API
export const getRelatedProducts = async (productId: string, limit: number = 6) => {
  try {
    const response = await api.get(`/products/${productId}/related?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching related products:', error);
    throw error;
  }
};

// Category API services
export const categoryApi = {
  // Lấy tất cả danh mục
  getCategories: async (): Promise<ApiResponse<{ categories: ApiCategory[] }>> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Lấy danh mục theo ID
  getCategory: async (id: string): Promise<ApiResponse<{ category: ApiCategory }>> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Tạo danh mục mới (admin)
  createCategory: async (categoryData: {
    nameCategory: string;
  }): Promise<ApiResponse<{ category: ApiCategory }>> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Cập nhật danh mục (admin)
  updateCategory: async (
    id: string,
    categoryData: Partial<{
      nameCategory: string;
    }>
  ): Promise<ApiResponse<{ category: ApiCategory }>> => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Xóa danh mục (admin)
  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Reviews API
export const getReviewsByProduct = async (productId: string, page = 1, limit = 10) => {
  const response = await api.get(`/product-reviews/product/${productId}`, { 
    params: { page, limit } 
  });
  return response.data;
};

export const getReviewsByUser = async (page = 1, limit = 10) => {
  const response = await api.get('/product-reviews/user', { 
    params: { page, limit } 
  });
  return response.data;
};

export const createReview = async (data: { 
  idProduct: string; 
  idOrderDetail: string; 
  rating: number; 
  review?: string 
}) => {
  const response = await api.post('/product-reviews', data);
  return response.data;
};

export const deleteReview = async (id: string) => {
  const response = await api.delete(`/product-reviews/${id}`);
  return response.data;
};

// Voucher API services
export const voucherApi = {
  // Lấy tất cả voucher
  getVouchers: async (): Promise<ApiResponse<{ vouchers: ApiVoucher[] }>> => {
    const response = await api.get('/vouchers');
    return response.data;
  },

  // Lấy voucher theo ID
  getVoucher: async (id: string): Promise<ApiResponse<{ voucher: ApiVoucher }>> => {
    const response = await api.get(`/vouchers/${id}`);
    return response.data;
  },

  // Tạo voucher mới (admin)
  createVoucher: async (voucherData: {
    code: string;
    discount: number;
    description: string;
    count: number;
    expiryDate: string;
  }): Promise<ApiResponse<{ voucher: ApiVoucher }>> => {
    const response = await api.post('/vouchers', voucherData);
    return response.data;
  },

  // Cập nhật voucher (admin)
  updateVoucher: async (
    id: string,
    voucherData: Partial<{
      code: string;
      discount: number;
      description: string;
      count: number;
      expiryDate: string;
    }>
  ): Promise<ApiResponse<{ voucher: ApiVoucher }>> => {
    const response = await api.patch(`/vouchers/${id}`, voucherData);
    return response.data;
  },

  // Xóa voucher (admin)
  deleteVoucher: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/vouchers/${id}`);
    return response.data;
  },
};

// Rewards API services
export const rewardsApi = {
  // Lấy thông tin điểm của user
  getUserPoints: async (): Promise<ApiResponse<{
    points: number;
    totalSpent: number;
    reviewCount: number;
    lastLoginDate: string;
  }>> => {
    const response = await api.get('/vouchers/rewards/points');
    return response.data;
  },

  // Lấy voucher có thể đổi bằng điểm
  getExchangeableVouchers: async (): Promise<ApiResponse<{ vouchers: ApiVoucher[] }>> => {
    const response = await api.get('/vouchers/rewards/exchangeable');
    return response.data;
  },

  // Đổi voucher bằng điểm
  exchangeVoucher: async (voucherId: string): Promise<ApiResponse<{
    voucher: ApiVoucher;
    remainingPoints: number;
  }>> => {
    const response = await api.post('/vouchers/rewards/exchange', { voucherId });
    return response.data;
  },

  // Cộng điểm từ đơn hàng
  addOrderPoints: async (orderAmount: number): Promise<ApiResponse<{
    pointsEarned: number;
    totalPoints: number;
    totalSpent: number;
  }>> => {
    const response = await api.post('/vouchers/rewards/order-points', { 
      userId: useAuthStore.getState().user?._id,
      orderAmount 
    });
    return response.data;
  },

  // Cộng điểm từ đánh giá
  addReviewPoints: async (): Promise<ApiResponse<{
    pointsEarned: number;
    totalPoints: number;
    reviewCount: number;
  }>> => {
    const response = await api.post('/vouchers/rewards/review-points', { 
      userId: useAuthStore.getState().user?._id 
    });
    return response.data;
  },

  // Kiểm tra và cộng điểm đăng nhập hàng ngày
  checkDailyLogin: async (): Promise<ApiResponse<{
    pointsEarned: number;
    totalPoints: number;
    lastLoginDate: string;
  }>> => {
    const response = await api.post('/vouchers/rewards/daily-login');
    return response.data;
  },
};

export default api;