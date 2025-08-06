import { API_CONFIG } from '../constants/config';

export interface Review {
  _id: string;
  idProduct: string;
  idOrderDetail: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
  idUser: {
    _id: string;
    name: string;
  };
  idProduct?: {
    _id: string;
    nameProduct: string;
  };
}

export interface CreateReviewRequest {
  idProduct: string;
  idOrderDetail: string;
  rating: number;
  review?: string;
}

// Tạo đánh giá sản phẩm
export const createReview = async (token: string, data: CreateReviewRequest): Promise<Review> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (response.ok) {
    const result = await response.json();
    return result.data.review;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể tạo đánh giá');
  }
};

// Lấy đánh giá theo sản phẩm
export const getReviewsByProduct = async (productId: string, page = 1, limit = 10): Promise<{ reviews: Review[], total: number }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/product/${productId}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const result = await response.json();
    return {
      reviews: result.data.reviews,
      total: result.results
    };
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể lấy đánh giá');
  }
};

// Lấy đánh giá của user
export const getUserReviews = async (token: string, page = 1, limit = 10): Promise<{ reviews: Review[], total: number }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/user?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const result = await response.json();
    return {
      reviews: result.data.reviews,
      total: result.results
    };
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể lấy đánh giá');
  }
};

// Xóa đánh giá
export const deleteReview = async (token: string, reviewId: string): Promise<void> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể xóa đánh giá');
  }
};
