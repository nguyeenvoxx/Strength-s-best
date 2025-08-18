import { create } from 'zustand';
import { NewsItem, getNewsList, getNewsDetail, searchNews } from '../services/newsApi';

interface NewsStore {
  news: NewsItem[];
  featuredNews: NewsItem[];
  currentNews: NewsItem | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  
  // Actions
  fetchNews: (page?: number, limit?: number) => Promise<void>;
  fetchNewsDetail: (newsId: string) => Promise<void>;
  searchNews: (searchTerm: string) => Promise<void>;
  clearError: () => void;
  resetNews: () => void;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  news: [],
  featuredNews: [],
  currentNews: null,
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  fetchNews: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      
      const newsData = await getNewsList({ page, limit });
      
      set((state) => ({
        news: page === 1 ? newsData : [...state.news, ...newsData],
        currentPage: page,
        hasMore: newsData.length === limit,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Error fetching news:', error);
      set({ 
        error: error.message || 'Không thể tải tin tức',
        loading: false 
      });
    }
  },

  fetchNewsDetail: async (newsId: string) => {
    try {
      set({ loading: true, error: null });
      
      const newsDetail = await getNewsDetail(newsId);
      
      set({ 
        currentNews: newsDetail,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error fetching news detail:', error);
      set({ 
        error: error.message || 'Không thể tải chi tiết tin tức',
        loading: false 
      });
    }
  },

  searchNews: async (searchTerm: string) => {
    try {
      set({ loading: true, error: null });
      
      const searchResults = await searchNews(searchTerm);
      
      set({ 
        news: searchResults,
        currentPage: 1,
        hasMore: false,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error searching news:', error);
      set({ 
        error: error.message || 'Không thể tìm kiếm tin tức',
        loading: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetNews: () => {
    set({ 
      news: [],
      currentNews: null,
      currentPage: 1,
      hasMore: true,
      error: null 
    });
  },
}));


