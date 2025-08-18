import { API_CONFIG } from './config';

export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
}

export interface NewsResponse {
  status: string;
  results?: number;
  data: {
    news: NewsItem[];
  };
}

export interface NewsDetailResponse {
  status: string;
  data: {
    news: NewsItem;
  };
}

// Lấy danh sách tin tức
export const getNewsList = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<NewsItem[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_CONFIG.BASE_URL}/news?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    
    // Xử lý các format response khác nhau
    if (data.data && Array.isArray(data.data.news)) {
      return data.data.news;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching news list:', error);
    throw error;
  }
};

// Lấy chi tiết tin tức
export const getNewsDetail = async (newsId: string): Promise<NewsItem> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/news/${newsId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsDetailResponse = await response.json();
    
    if (data.data && data.data.news) {
      return data.data.news;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching news detail:', error);
    throw error;
  }
};

// Lấy tin tức nổi bật (có thể thêm sau)
export const getFeaturedNews = async (limit: number = 5): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/news?limit=${limit}&featured=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    
    if (data.data && Array.isArray(data.data.news)) {
      return data.data.news;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching featured news:', error);
    throw error;
  }
};

// Tìm kiếm tin tức
export const searchNews = async (searchTerm: string, page: number = 1, limit: number = 10): Promise<NewsItem[]> => {
  try {
    const queryParams = new URLSearchParams({
      search: searchTerm,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_CONFIG.BASE_URL}/news?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    
    if (data.data && Array.isArray(data.data.news)) {
      return data.data.news;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error searching news:', error);
    throw error;
  }
};
