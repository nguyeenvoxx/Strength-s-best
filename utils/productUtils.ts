import { ApiProduct } from '../services/api';
import { Product, ProductSection } from '../types/product.type';

// Chuyển đổi từ ApiProduct sang Product interface của frontend
export const transformApiProductToProduct = (apiProduct: ApiProduct): Product => {
  // Tạo sections từ description
  const sections: ProductSection[] = [];
  
  if (apiProduct.description) {
    // Tách description thành các sections
    const descriptionParts = apiProduct.description.split('\n\n');
    
    sections.push({
      title: 'Tổng quan',
      items: [apiProduct.description]
    });
    
    // Thêm thông tin brand và category
    const brandName = typeof apiProduct.idBrand === 'object' && apiProduct.idBrand?.nameBrand 
      ? apiProduct.idBrand.nameBrand 
      : 'Không xác định';
    
    const categoryName = typeof apiProduct.idCategory === 'object' && apiProduct.idCategory?.nameCategory 
      ? apiProduct.idCategory.nameCategory 
      : 'Không xác định';
    
    sections.push({
      title: 'Thông tin sản phẩm',
      items: [
        `Thương hiệu: ${brandName}`,
        `Danh mục: ${categoryName}`,
        `Số lượng có sẵn: ${apiProduct.quantity}`,
        `Trạng thái: ${apiProduct.status === 'active' ? 'Đang bán' : apiProduct.status === 'available' ? 'Có sẵn' : 'Ngừng bán'}`
      ]
    });
  }

  return {
    _id: apiProduct._id,
    id: apiProduct._id,
    title: apiProduct.nameProduct,
    image: apiProduct.image,
    images: [apiProduct.image], // API chỉ có 1 image, frontend expect array
    rating: 5, // Default rating vì API không có field này
    price: formatPrice(apiProduct.priceProduct),
    priceProduct: apiProduct.priceProduct,
    sections
  };
};

// Format giá tiền theo định dạng VND
export const formatPrice = (price: number): string => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Tạo URL image đầy đủ nếu cần
export const getFullImageUrl = (imagePath: string): string => {
  // Nếu imagePath đã là URL đầy đủ thì return luôn
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Nếu là relative path thì thêm base URL
  const BASE_URL = 'http://localhost:3000';
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// Tạo description ngắn từ product
export const getShortDescription = (product: Product): string => {
  if (!product.sections || !Array.isArray(product.sections)) {
    return 'Mô tả ngắn sản phẩm';
  }
  
  const overview = product.sections.find(s => s && s.title === 'Tổng quan');
  if (overview && overview.items && Array.isArray(overview.items) && overview.items.length > 0) {
    const item = overview.items[0];
    if (typeof item === 'string' && item) {
      // Cắt ngắn description nếu quá dài
      return item.length > 100 ? `${item.substring(0, 100)}...` : item;
    }
  }
  
  if (product.sections[0] && product.sections[0].items && Array.isArray(product.sections[0].items) && product.sections[0].items.length > 0) {
    const item = product.sections[0].items[0];
    if (typeof item === 'string' && item) {
      return item.length > 100 ? `${item.substring(0, 100)}...` : item;
    }
  }
  
  return 'Mô tả ngắn sản phẩm';
};

// Tính giá gốc (giả sử có discount)
export const calculateOriginalPrice = (currentPrice: string, discountPercent: number = 40): string => {
  const numericPrice = parseInt(currentPrice.replace(/[^\d]/g, '')) || 0;
  const originalPrice = Math.round(numericPrice / (1 - discountPercent / 100));
  return formatPrice(originalPrice);
};