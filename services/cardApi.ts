import { API_CONFIG } from '../constants/config';

export interface Card {
  _id: string;
  userId: string;
  cardNumber: string; // Full card number (encrypted)
  maskedCardNumber: string; // Masked number like "**** **** **** 1234"
  cardType: string; // visa, mastercard, amex
  expiryDate: string;
  cardHolder: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddCardRequest {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType?: string;
}

export interface UpdateCardRequest {
  cardHolder?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

// Lấy danh sách thẻ của user
export const getUserCards = async (token: string): Promise<Card[]> => {
  try {
    console.log('🔍 getUserCards called with token:', token ? 'valid' : 'invalid');
    
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      throw new Error(errorData.message || 'Không thể lấy danh sách thẻ');
    }

    const data = await response.json();
    console.log('✅ API Response data:', data);
    console.log('📊 Cards count from API:', data.data?.length || 0);
    
    return data.data || [];
  } catch (error) {
    console.error('❌ Error fetching cards:', error);
    throw error;
  }
};

// Thêm thẻ mới
export const addCard = async (token: string, cardData: AddCardRequest): Promise<any> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể thêm thẻ');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding card:', error);
    throw error;
  }
};

// Cập nhật thông tin thẻ
export const updateCard = async (token: string, cardId: string, updateData: UpdateCardRequest): Promise<Card> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể cập nhật thẻ');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

// Xóa thẻ
export const deleteCard = async (token: string, cardId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xóa thẻ');
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

// Đặt thẻ làm mặc định
export const setDefaultCard = async (token: string, cardId: string): Promise<Card> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/${cardId}/set-default`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể đặt thẻ mặc định');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error setting default card:', error);
    throw error;
  }
};

// Xác thực thẻ
export const verifyCard = async (token: string, cardId: string, otp: string): Promise<void> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId, otp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xác thực thẻ');
    }
  } catch (error) {
    console.error('Error verifying card:', error);
    throw error;
  }
};

// Gửi lại mã xác thực
export const resendCardVerification = async (token: string, cardId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ cardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể gửi lại mã xác thực');
    }
  } catch (error) {
    console.error('Error resending verification:', error);
    throw error;
  }
};