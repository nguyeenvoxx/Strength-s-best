import { create } from 'zustand';
import { productApi } from '../services/api';
import { Product } from '../types/product.type';
import { transformApiProductToProduct } from '../utils/productUtils';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (limit?: number) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  clearError: () => void;
  setCurrentProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async (limit = 20) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productApi.getProducts({ limit });
      
      if (response.status === 'success' || response.status === 'thành công') {
        const transformedProducts = response.data.products.map(transformApiProductToProduct);
        set({
          products: transformedProducts,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Không thể tải danh sách sản phẩm');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      
      let errorMessage = 'Lỗi khi tải sản phẩm';
      
      if (error.response?.status === 401) {
        errorMessage = 'Vui lòng đăng nhập để xem sản phẩm';
      } else if (error.response?.data?.message) {
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
      
      set({
        isLoading: false,
        error: errorMessage,
        products: [],
      });
      
      // Don't throw error to prevent app crash
      console.warn('Products fetch failed:', errorMessage);
    }
  },

  fetchProductById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await productApi.getProduct(id);
      
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
      
      let errorMessage = 'Lỗi khi tải sản phẩm';
      
      if (error.response?.status === 401) {
        errorMessage = 'Vui lòng đăng nhập để xem chi tiết sản phẩm';
      } else if (error.response?.data?.message) {
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
      
      set({
        isLoading: false,
        error: errorMessage,
        currentProduct: null,
      });
      
      // Don't throw error to prevent app crash
      console.warn('Product fetch by ID failed:', errorMessage);
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

  updateProduct: (id: string, updatedProduct: Partial<Product>) => {
    set((state) => ({
      products: state.products.map((product) =>
        product._id === id ? { ...product, ...updatedProduct } : product
      ),
      currentProduct:
        state.currentProduct?._id === id
          ? { ...state.currentProduct, ...updatedProduct }
          : state.currentProduct,
    }));
  },

  removeProduct: (id: string) => {
    set((state) => ({
      products: state.products.filter((product) => product._id !== id),
      currentProduct:
        state.currentProduct?._id === id ? null : state.currentProduct,
    }));
  },
}));