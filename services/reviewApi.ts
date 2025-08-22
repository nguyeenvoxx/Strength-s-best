import { API_CONFIG } from '../constants/config';
import { handleTokenExpired } from './api';

export interface Review {
  _id: string;
  idOrderDetail: string;
  rating: number;
  review?: string;
  helpfulCount: number;
  likedBy: string[];
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
    console.error('Error fetching user reviews:', errorData);
    
    // Xử lý token expired
    if (response.status === 401 && handleTokenExpired(errorData)) {
      return { reviews: [], total: 0 };
    }
    
    // Không throw error để tránh hiển thị lỗi kỹ thuật cho user
    return { reviews: [], total: 0 };
  }
};

// Kiểm tra trạng thái đánh giá cho một sản phẩm và order detail cụ thể
export const checkReviewStatus = async (token: string, productId: string, orderDetailId: string): Promise<{ hasReviewed: boolean, review: Review | null }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/check-status/${productId}/${orderDetailId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const result = await response.json();
    return result.data;
  } else {
    const errorData = await response.json();
    console.error('Error checking review status:', errorData);
    
    // Xử lý token expired
    if (response.status === 401 && handleTokenExpired(errorData)) {
      return { hasReviewed: false, review: null };
    }
    
    // Không throw error để tránh hiển thị lỗi kỹ thuật cho user
    return { hasReviewed: false, review: null };
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

// Like đánh giá
export const likeReview = async (token: string, reviewId: string): Promise<{ review: Review, isLiked: boolean, helpfulCount: number }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/${reviewId}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const result = await response.json();
    return result.data;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể like đánh giá');
  }
};

// Unlike đánh giá
export const unlikeReview = async (token: string, reviewId: string): Promise<{ review: Review, isLiked: boolean, helpfulCount: number }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/${reviewId}/like`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const result = await response.json();
    return result.data;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể unlike đánh giá');
  }
};

// Kiểm tra trạng thái like
export const checkLikeStatus = async (token: string, reviewId: string): Promise<{ isLiked: boolean, helpfulCount: number }> => {
  const response = await fetch(`${API_CONFIG.BASE_URL}/product-reviews/${reviewId}/like-status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const result = await response.json();
    return result.data;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Không thể kiểm tra trạng thái like');
  }
};














