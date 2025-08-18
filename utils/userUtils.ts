import { API_CONFIG } from '../constants/config';

// Chuẩn hóa URL avatar người dùng thành URL đầy đủ để React Native có thể tải được
export const getUserAvatarUrl = (avatarUrl?: string | null): string | null => {
  if (!avatarUrl || typeof avatarUrl !== 'string' || avatarUrl.trim() === '') {
    return null;
  }

  const trimmed = avatarUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Lấy origin từ BASE_URL (bỏ phần /api/v1)
  const origin = API_CONFIG.BASE_URL.replace(/\/?api\/?v\d+\/?$/, '').replace(/\/$/, '');

  // Đảm bảo có dấu /
  if (trimmed.startsWith('/')) {
    return `${origin}${trimmed}`;
  }
  return `${origin}/${trimmed}`;
};


