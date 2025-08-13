// services/addressApi.ts
import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';

export interface Address {
  _id?: string;
  userId?: string;
  name: string;
  phone: string;
  address: string;
  province?: string; // Có thể rỗng
  district?: string; // Có thể rỗng
  ward?: string; // Có thể rỗng
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressRequest {
  name: string;
  phone: string;
  address: string;
  province?: string; // Có thể rỗng
  district?: string; // Có thể rỗng
  ward?: string; // Có thể rỗng
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  name: string;
  phone: string;
  address: string;
  province?: string; // Có thể rỗng
  district?: string; // Có thể rỗng
  ward?: string; // Có thể rỗng
  isDefault?: boolean;
}

// Lấy danh sách địa chỉ của user
export const getUserAddresses = async (token: string): Promise<Address[]> => {
  try {
    // Debug: Log token trước khi gửi
    console.log('🔍 AddressAPI - Token length:', token?.length);
    console.log('🔍 AddressAPI - Token valid format:', token && typeof token === 'string' && token.length > 10);
    console.log('🔍 AddressAPI - URL:', `${API_CONFIG.BASE_URL}/addresses`);
    
    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new Error('Token không hợp lệ');
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.trim()}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.addresses || [];
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể lấy danh sách địa chỉ');
    }
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
};

// Thêm địa chỉ mới
export const addAddress = async (token: string, addressData: CreateAddressRequest): Promise<Address> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.address;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể thêm địa chỉ');
    }
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Cập nhật địa chỉ
export const updateAddress = async (token: string, addressId: string, addressData: UpdateAddressRequest): Promise<Address> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.address;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể cập nhật địa chỉ');
    }
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Xóa địa chỉ
export const deleteAddress = async (token: string, addressId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Không thể xóa địa chỉ');
    }
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Đặt địa chỉ làm mặc định
export const setDefaultAddress = async (token: string, addressId: string): Promise<Address> => {
  try {
    console.log('🔍 Setting default address:', addressId);
    console.log('🔍 URL:', `${API_CONFIG.BASE_URL}/addresses/${addressId}/default`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/addresses/${addressId}/default`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log('🔍 Success response:', data);
      return data.data?.address;
    } else {
      const responseText = await response.text();
      console.log('🔍 Error response text:', responseText);
      
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || 'Không thể đặt địa chỉ mặc định');
      } catch (parseError) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }
    }
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
}; 