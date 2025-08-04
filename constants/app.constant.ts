import { Product } from '../types/product.type';

// Các constant cho app
export const APP_CONSTANTS = {
  // API endpoints
  API_BASE_URL: 'http://192.168.1.49:3000/api/v1',
  
  // App settings
  APP_NAME: 'Strength Best',
  APP_VERSION: '1.0.0',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Timeouts
  API_TIMEOUT: 30000,
  REQUEST_TIMEOUT: 10000,
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Không thể kết nối đến server',
    TIMEOUT_ERROR: 'Kết nối bị timeout',
    SERVER_ERROR: 'Lỗi server',
    UNKNOWN_ERROR: 'Có lỗi xảy ra',
    NO_DATA: 'Không có dữ liệu',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    UPDATE_SUCCESS: 'Cập nhật thành công',
    DELETE_SUCCESS: 'Xóa thành công',
  },
};

// Kiểm tra xem có nên sử dụng sample data không
export const shouldUseSampleData = (): boolean => {
  // Có thể thêm logic kiểm tra network, API status, etc.
  return false; // Mặc định không sử dụng sample data
};

// Fallback products khi API không có dữ liệu
export const getFallbackProducts = (): Product[] => {
  return [
    {
      _id: 'fallback-1',
      id: 'fallback-1',
      title: 'Dầu cá Omega 3',
      image: 'https://via.placeholder.com/300x300?text=Omega+3',
      images: ['https://via.placeholder.com/300x300?text=Omega+3'],
      rating: 5,
      price: 250000,
      priceProduct: 250000,
      sections: [
        {
          title: 'Tổng quan',
          items: ['Dầu cá Omega 3 chất lượng cao, hỗ trợ tim mạch và não bộ']
        },
        {
          title: 'Công dụng',
          items: [
            'Hỗ trợ tim mạch',
            'Tăng cường trí nhớ',
            'Giảm viêm khớp'
          ]
        }
      ],
      idCategory: 'supplements'
    },
    {
      _id: 'fallback-2',
      id: 'fallback-2',
      title: 'Vitamin D3',
      image: 'https://via.placeholder.com/300x300?text=Vitamin+D3',
      images: ['https://via.placeholder.com/300x300?text=Vitamin+D3'],
      rating: 5,
      price: 180000,
      priceProduct: 180000,
      sections: [
        {
          title: 'Tổng quan',
          items: ['Vitamin D3 giúp tăng cường hệ miễn dịch và xương khớp']
        },
        {
          title: 'Công dụng',
          items: [
            'Tăng cường miễn dịch',
            'Hỗ trợ xương khớp',
            'Cải thiện tâm trạng'
          ]
        }
      ],
      idCategory: 'vitamins'
    },
    {
      _id: 'fallback-3',
      id: 'fallback-3',
      title: 'Whey Protein',
      image: 'https://via.placeholder.com/300x300?text=Whey+Protein',
      images: ['https://via.placeholder.com/300x300?text=Whey+Protein'],
      rating: 5,
      price: 1200000,
      priceProduct: 1200000,
      sections: [
        {
          title: 'Tổng quan',
          items: ['Whey Protein chất lượng cao cho người tập gym']
        },
        {
          title: 'Công dụng',
          items: [
            'Tăng cơ bắp',
            'Phục hồi sau tập',
            'Tăng sức mạnh'
          ]
        }
      ],
      idCategory: 'protein'
    },
    {
      _id: 'fallback-4',
      id: 'fallback-4',
      title: 'Magie Blackmores',
      image: 'https://via.placeholder.com/300x300?text=Magnesium',
      images: ['https://via.placeholder.com/300x300?text=Magnesium'],
      rating: 5,
      price: 320000,
      priceProduct: 320000,
      sections: [
        {
          title: 'Tổng quan',
          items: ['Magie từ Blackmores hỗ trợ thần kinh và cơ bắp']
        },
        {
          title: 'Công dụng',
          items: [
            'Thư giãn cơ bắp',
            'Hỗ trợ giấc ngủ',
            'Chức năng thần kinh'
          ]
        }
      ],
      idCategory: 'minerals'
    },
    {
      _id: 'fallback-5',
      id: 'fallback-5',
      title: 'Creatine Monohydrate',
      image: 'https://via.placeholder.com/300x300?text=Creatine',
      images: ['https://via.placeholder.com/300x300?text=Creatine'],
      rating: 5,
      price: 550000,
      priceProduct: 550000,
      sections: [
        {
          title: 'Tổng quan',
          items: ['Creatine tăng sức mạnh và hiệu suất tập luyện']
        },
        {
          title: 'Công dụng',
          items: [
            'Tăng sức mạnh',
            'Tăng hiệu suất',
            'Tăng khối lượng cơ'
          ]
        }
      ],
      idCategory: 'performance'
    },
    {
      _id: 'fallback-6',
      id: 'fallback-6',
      title: 'BCAA Amino Acids',
      image: 'https://via.placeholder.com/300x300?text=BCAA',
      images: ['https://via.placeholder.com/300x300?text=BCAA'],
      rating: 5,
      price: 450000,
      priceProduct: 450000,
      sections: [
        {
          title: 'Tổng quan',
          items: ['BCAA hỗ trợ phục hồi cơ bắp và giảm mệt mỏi']
        },
        {
          title: 'Công dụng',
          items: [
            'Phục hồi cơ bắp',
            'Giảm mệt mỏi',
            'Tăng hiệu suất'
          ]
        }
      ],
      idCategory: 'amino-acids'
    }
  ];
};
