import { API_CONFIG } from '../services/config';

// Function để xử lý URL hình ảnh news
export const getNewsImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Tin+tức';
  }

  const raw = String(imagePath).trim().replace(/\\/g, '/');
  
  // Data URI (base64)
  if (raw.startsWith('data:image')) {
    return raw;
  }
  
  // URL đầy đủ
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return encodeURI(raw);
  }

  // Lấy origin từ BASE_URL (bỏ phần /api/v1)
  const origin = API_CONFIG.BASE_URL
    .replace(/\/?api\/?v\d+\/?$/, '')
    .replace(/\/$/, '');

  // Nếu backend trả về path bắt đầu bằng '/'
  if (raw.startsWith('/')) {
    return encodeURI(`${origin}${raw}`);
  }

  // Nếu là tên file (không có '/'), gắn vào uploads/news
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(raw) && !raw.includes('/')) {
    return encodeURI(`${origin}/uploads/news/${raw}`);
  }

  // Mặc định: nối origin với path tương đối
  return encodeURI(`${origin}/${raw}`);
};

// Function để validate image URL
export const isValidNewsImageUrl = (url: string): boolean => {
  return Boolean(url && url !== 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Tin+tức');
};

// Function để format date cho news
export const formatNewsDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Function để format date chi tiết cho news
export const formatNewsDateDetailed = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


