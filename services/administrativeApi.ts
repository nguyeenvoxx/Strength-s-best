import { API_CONFIG } from './config';

export interface AdministrativeOption {
  code: string;
  name: string;
} 

export interface AddressData {
  provinces: AdministrativeOption[];
  districts: Record<string, AdministrativeOption[]>;
  wards: Record<string, AdministrativeOption[]>;
}

// Lấy danh sách tỉnh/thành phố
export const getProvinces = async (): Promise<AdministrativeOption[]> => {
  try {
    console.log('🌍 AdministrativeAPI - Fetching provinces...');
    const response = await fetch(`${API_CONFIG.BASE_URL}/administrative/provinces`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🌍 AdministrativeAPI - Provinces response:', data.results, 'items');
    return data.data || [];
  } catch (error) {
    console.error('❌ AdministrativeAPI - Error fetching provinces:', error);
    throw new Error('Không thể tải danh sách tỉnh/thành phố');
  }
};

// Lấy danh sách quận/huyện theo tỉnh
export const getDistrictsByProvince = async (provinceCode: string): Promise<AdministrativeOption[]> => {
  try {
    console.log('🏘️ AdministrativeAPI - Fetching districts for province:', provinceCode);
    const response = await fetch(`${API_CONFIG.BASE_URL}/administrative/districts/${provinceCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🏘️ AdministrativeAPI - Districts response:', data.results, 'items');
    return data.data || [];
  } catch (error) {
    console.error('❌ AdministrativeAPI - Error fetching districts:', error);
    throw new Error('Không thể tải danh sách quận/huyện');
  }
};

// Lấy danh sách phường/xã theo quận/huyện
export const getWardsByDistrict = async (districtCode: string): Promise<AdministrativeOption[]> => {
  try {
    console.log('🏠 AdministrativeAPI - Fetching wards for district:', districtCode);
    const response = await fetch(`${API_CONFIG.BASE_URL}/administrative/wards/${districtCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🏠 AdministrativeAPI - Wards response:', data.results, 'items');
    return data.data || [];
  } catch (error) {
    console.error('❌ AdministrativeAPI - Error fetching wards:', error);
    throw new Error('Không thể tải danh sách phường/xã');
  }
};

// Lấy tất cả dữ liệu địa chỉ (cho cache)
export const getAllAddressData = async (): Promise<AddressData> => {
  try {
    console.log('🗺️ AdministrativeAPI - Fetching all address data...');
    const response = await fetch(`${API_CONFIG.BASE_URL}/administrative/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🗺️ AdministrativeAPI - All address data response:', {
      provinces: data.data.provinces?.length || 0,
      districts: Object.keys(data.data.districts || {}).length,
      wards: Object.keys(data.data.wards || {}).length
    });
    
    return data.data || { provinces: [], districts: {}, wards: {} };
  } catch (error) {
    console.error('❌ AdministrativeAPI - Error fetching all address data:', error);
    throw new Error('Không thể tải dữ liệu địa chỉ');
  }
};