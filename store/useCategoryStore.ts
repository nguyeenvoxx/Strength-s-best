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

// Fallback categories khi API không có dữ liệu
const getFallbackCategories = (): Category[] => {
  return [
    {
      _id: 'category-1',
      nameCategory: 'Thực phẩm bổ sung',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-2',
      nameCategory: 'Vitamin và khoáng chất',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-3',
      nameCategory: 'Protein',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-4',
      nameCategory: 'Omega-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-5',
      nameCategory: 'Thực phẩm chức năng',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-6',
      nameCategory: 'Amino Acid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-7',
      nameCategory: 'Enzyme',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-8',
      nameCategory: 'Probiotic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-9',
      nameCategory: 'Antioxidant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-10',
      nameCategory: 'Herbal Supplement',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-11',
      nameCategory: 'Joint Health',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-12',
      nameCategory: 'Heart Health',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-13',
      nameCategory: 'Brain Health',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-14',
      nameCategory: 'Digestive Health',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-15',
      nameCategory: 'Immune Support',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-16',
      nameCategory: 'Energy & Performance',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-17',
      nameCategory: 'Weight Management',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-18',
      nameCategory: 'Beauty & Skin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-19',
      nameCategory: 'Sleep Support',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-20',
      nameCategory: 'Stress & Mood',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      _id: 'category-21',
      nameCategory: 'Bone Health',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoryApi.getCategories();
      
      if (response.status === 'success' || response.status === 'thành công') {
        let categories = response.data.categories;
        
        // Nếu API trả về mảng rỗng, sử dụng fallback data
        if (!categories || categories.length === 0) {
          console.log('API trả về mảng rỗng, sử dụng fallback categories');
          categories = getFallbackCategories();
        }
        
        set({ 
          categories, 
          isLoading: false,
          error: null
        });
      } else {
        throw new Error(response.message || 'Không thể tải danh mục');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      
      // Sử dụng fallback data khi có lỗi
      console.log('Sử dụng fallback categories do lỗi:', error.message);
      const fallbackCategories = getFallbackCategories();
      
      set({ 
        categories: fallbackCategories,
        isLoading: false,
        error: null // Không hiển thị lỗi nếu có fallback data
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 