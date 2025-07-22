import { create } from 'zustand';
import { categoryApi } from '../services/api';

export interface Category {
  _id: string;
  nameCategory: string;
  created_at: string;
  updated_at: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.getCategories();
      set({ 
        categories: response.data.categories, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Lỗi khi tải danh mục', 
        isLoading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 