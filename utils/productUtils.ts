import { ApiProduct } from '../services/api';
import { Product, ProductSection } from '../types/product.type';

// Chuyển đổi từ ApiProduct sang Product interface của frontend
export const transformApiProductToProduct = (apiProduct: ApiProduct): Product => {
  // Tạo sections mặc định
  const sections: ProductSection[] = [];
  
  // Thêm thông tin brand và category
  const brandName = typeof apiProduct.idBrand === 'object' && apiProduct.idBrand?.nameBrand 
    ? apiProduct.idBrand.nameBrand 
    : 'Không xác định';
  
  const categoryName = typeof apiProduct.idCategory === 'object' && apiProduct.idCategory?.nameCategory 
    ? apiProduct.idCategory.nameCategory 
    : 'Không xác định';
  
  // Tạo section tổng quan
  sections.push({
    title: 'Tổng quan',
    items: [
      { text: apiProduct.description || 'Sản phẩm chất lượng cao, được sản xuất theo tiêu chuẩn quốc tế.', hasBullet: false }
    ]
  });
  
  // Tạo section thông tin sản phẩm
  sections.push({
    title: 'Thông tin sản phẩm',
    items: [
      { text: `Thương hiệu: ${brandName}`, hasBullet: false },
      { text: `Danh mục: ${categoryName}`, hasBullet: false },
      { text: `Số lượng có sẵn: ${apiProduct.quantity}`, hasBullet: false },
      { text: `Trạng thái: ${apiProduct.status === 'active' ? 'Đang bán' : apiProduct.status === 'available' ? 'Có sẵn' : 'Ngừng bán'}`, hasBullet: false }
    ]
  });

  // Tạo section thành phần (nếu có)
  if (apiProduct.ingredients) {
    sections.push({
      title: 'Thành phần',
      items: [
        { text: apiProduct.ingredients, hasBullet: false }
      ]
    });
  }

  // Tạo section liều dùng (nếu có)
  if (apiProduct.dosage) {
    sections.push({
      title: 'Liều dùng',
      items: [
        { text: apiProduct.dosage, hasBullet: false }
      ]
    });
  }

  // Tạo section công dụng (nếu có benefits từ backend)
  if (apiProduct.benefits && apiProduct.benefits.length > 0) {
    sections.push({
      title: 'Công dụng',
      items: apiProduct.benefits.map(benefit => ({ text: benefit, hasBullet: true }))
    });
  } else {
    // Fallback nếu không có benefits từ backend
    sections.push({
      title: 'Công dụng',
      items: [
        { text: 'Hỗ trợ tăng cường sức khỏe', hasBullet: true },
        { text: 'Bổ sung dinh dưỡng cần thiết', hasBullet: true },
        { text: 'Tăng cường hệ miễn dịch', hasBullet: true }
      ]
    });
  }

  // Tạo section cảnh báo (nếu có)
  if (apiProduct.warnings && apiProduct.warnings.length > 0) {
    sections.push({
      title: 'Lưu ý và cảnh báo',
      items: apiProduct.warnings.map(warning => ({ text: warning, hasBullet: true }))
    });
  }

  // Tạo section bảo quản (nếu có)
  if (apiProduct.storage) {
    sections.push({
      title: 'Bảo quản',
      items: [
        { text: apiProduct.storage, hasBullet: false }
      ]
    });
  }

  // Tạo section hạn sử dụng (nếu có)
  if (apiProduct.expiry) {
    sections.push({
      title: 'Hạn sử dụng',
      items: [
        { text: apiProduct.expiry, hasBullet: false }
      ]
    });
  }

  const result = {
    _id: apiProduct._id,
    id: apiProduct._id,
    title: apiProduct.nameProduct,
    image: apiProduct.image,
    images: [apiProduct.image], // API chỉ có 1 image, frontend expect array
    rating: 5, // Default rating vì API không có field này
    price: apiProduct.priceProduct, // Giữ nguyên số nguyên
    priceProduct: apiProduct.priceProduct,
    discount: apiProduct.discount || 0, // Thêm discount từ API
    quantity: apiProduct.quantity, // Thêm quantity từ API
    status: apiProduct.status, // Thêm status từ API
    sections,
    idCategory: apiProduct.idCategory,
    idBrand: apiProduct.idBrand
  };
  
  return result;
};

// Format giá tiền theo định dạng VND
export const formatPrice = (price: number): string => {
  if (!price || price <= 0) return 'Liên hệ';
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Tạo URL image đầy đủ nếu cần
export const getFullImageUrl = (imagePath: string): string => {
  return getProductImageUrl(imagePath);
};

// Tạo description ngắn từ product
export const getShortDescription = (product: Product): string => {
  if (!product.sections || !Array.isArray(product.sections)) {
    return 'Mô tả ngắn sản phẩm';
  }
  
  const overview = product.sections.find(s => s && s.title === 'Tổng quan');
  if (overview && overview.items && Array.isArray(overview.items) && overview.items.length > 0) {
    const item = overview.items[0];
    if (item && typeof item === 'object' && 'text' in item) {
      // Cắt ngắn description nếu quá dài
      return item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text;
    }
  }
  
  if (product.sections[0] && product.sections[0].items && Array.isArray(product.sections[0].items) && product.sections[0].items.length > 0) {
    const item = product.sections[0].items[0];
    if (item && typeof item === 'object' && 'text' in item) {
      return item.text.length > 100 ? `${item.text.substring(0, 100)}...` : item.text;
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

// Function để xử lý URL hình ảnh sản phẩm
export const getProductImageUrl = (imagePath: string | null | undefined): string => {
  console.log('🔍 getProductImageUrl input:', imagePath);
  
  if (!imagePath) {
    console.log('🔍 No imagePath, returning placeholder');
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }
  
  // Nếu là URL đầy đủ
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🔍 Full URL detected:', imagePath);
    return imagePath;
  }
  
  // Nếu là tên file, sử dụng static file serving
  if (imagePath.includes('.jpg') || imagePath.includes('.png') || imagePath.includes('.jpeg')) {
    const baseUrl = 'http://192.168.1.49:3000'; // Thay bằng URL backend thực tế
    const fullUrl = `${baseUrl}/uploads/products/${imagePath}`;
    console.log('🔍 Generated image URL:', fullUrl);
    return fullUrl;
  }
  
  // Fallback
  console.log('🔍 No valid image format, returning placeholder');
  return 'https://via.placeholder.com/300x300?text=Product+Image';
};

// Function để lấy danh sách hình ảnh sản phẩm
export const getProductImages = (product: any): string[] => {
  console.log('🔍 getProductImages input:', product);
  
  if (!product) return [];
  
  const images: string[] = [];
  
  // Thêm image chính
  if (product.image) {
    console.log('🔍 Product image:', product.image);
    const imageUrl = getProductImageUrl(product.image);
    console.log('🔍 Generated image URL:', imageUrl);
    images.push(imageUrl);
  }
  
  // Thêm images array nếu có
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: string) => {
      if (img && !images.includes(img)) {
        const imageUrl = getProductImageUrl(img);
        console.log('🔍 Generated image URL from array:', imageUrl);
        images.push(imageUrl);
      }
    });
  }
  
  // Nếu không có hình ảnh nào, thêm placeholder
  if (images.length === 0) {
    console.log('🔍 No images found, adding placeholder');
    images.push('https://via.placeholder.com/300x300?text=Product+Image');
  }
  
  console.log('🔍 Final images array:', images);
  return images;
};

// Function để validate image URL
export const isValidImageUrl = (url: string): boolean => {
  return Boolean(url && url !== 'https://via.placeholder.com/300x300?text=No+Image');
};