import { create } from 'zustand';
import { getProducts, getProduct, getRelatedProducts } from '../services/api';
import { transformApiProductToProduct } from '../utils/productUtils';
import { getFallbackProducts } from '../constants/app.constant';

export interface Product {
  _id: string;
  id: string;
  title: string;
  image?: string;
  images: string[];
  rating: number;
  price: number;
  priceProduct: number;
  discount?: number; // Thêm trường discount
  quantity?: number; // Thêm trường quantity
  status?: string; // Thêm trường status
  sections: any[];
  idCategory?: string | { _id: string; nameCategory: string };
  idBrand?: string | { _id: string; name: string };
  favoriteId?: string;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  
  // Actions
  fetchProducts: (params?: { 
    page?: number;
    limit?: number; 
    category?: string; 
    brand?: string; 
    search?: string;
    sort?: string;
  }) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchRelatedProducts: (productId: string) => Promise<void>;
  clearError: () => void;
  setCurrentProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setPage: (page: number) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  relatedProducts: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,

  fetchProducts: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      const withDefaults: any = { limit: 20, page: 1, ...params };
      const response = await getProducts(withDefaults);
      
      if (response.status === 'success' || response.status === 'thành công') {
        let transformedProducts = response.data.products.map(transformApiProductToProduct);
        
        // Nếu API trả về mảng rỗng, sử dụng fallback data
        if (transformedProducts.length === 0) {
          console.log('API trả về mảng rỗng, sử dụng fallback data');
          transformedProducts = getFallbackProducts();
        }
        
        // Cập nhật thông tin phân trang
        const currentPage = withDefaults.page || 1;
        const totalProducts = response.results || transformedProducts.length;
        const limit = withDefaults.limit || 10;
        const totalPages = Math.ceil(totalProducts / limit);
        
        set({
          products: transformedProducts,
          currentPage,
          totalPages,
          totalProducts,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      
      let errorMessage = 'Lỗi khi tải sản phẩm';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'Không thể kết nối đến server';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Kết nối bị timeout';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Sử dụng fallback data khi có lỗi
      console.log('Sử dụng fallback data do lỗi:', errorMessage);
      const fallbackProducts = getFallbackProducts();
      
      set({
        isLoading: false,
        error: null, // Không hiển thị lỗi nếu có fallback data
        products: fallbackProducts,
        currentPage: 1,
        totalPages: 1,
        totalProducts: fallbackProducts.length,
      });
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page });
  },

  fetchProductById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await getProduct(id);
      
      if (response.status === 'success' || response.status === 'thành công') {
        const transformedProduct = transformApiProductToProduct(response.data.product);
        set({
          currentProduct: transformedProduct,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Không thể tải thông tin sản phẩm');
      }
    } catch (error: any) {
      console.error('Error fetching product by ID:', error.message);
      set({
        isLoading: false,
        error: error.message || 'Lỗi khi tải thông tin sản phẩm',
      });
    }
  },

  fetchRelatedProducts: async (productId: string) => {
    try {
      console.log('🔍 Fetching related products for:', productId);
      const response = await getRelatedProducts(productId, 6);
      console.log('🔍 Related products response:', response);
      
      if (response.status === 'success' || response.status === 'thành công') {
        const transformedProducts = response.data.products.map(transformApiProductToProduct);
        console.log('🔍 Transformed related products:', transformedProducts.length);
        set({
          relatedProducts: transformedProducts,
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching related products:', error.message);
      // Không set error vì related products không quan trọng
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentProduct: (product: Product | null) => {
    set({ currentProduct: product });
  },

  addProduct: (product: Product) => {
    set((state) => ({
      products: [...state.products, product],
    }));
  },

  updateProduct: (id: string, product: Partial<Product>) => {
    set((state) => ({
      products: state.products.map((p) =>
        p._id === id ? { ...p, ...product } : p
      ),
    }));
  },

  removeProduct: (id: string) => {
    set((state) => ({
      products: state.products.filter((p) => p._id !== id),
    }));
  },
}));