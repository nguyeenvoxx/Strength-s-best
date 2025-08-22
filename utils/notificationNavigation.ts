import { router } from 'expo-router';

export interface NotificationNavigation {
  route: 'order-detail' | 'product-detail' | 'news-detail' | 'voucher-list' | 'review-list' | 'purchased-orders' | 'profile' | 'home';
  params: Record<string, string>;
}

/**
 * Xử lý navigation từ thông báo
 * @param navigation - Thông tin navigation từ thông báo
 * @param fallbackType - Loại thông báo để fallback nếu không có navigation
 */
export const handleNotificationNavigation = (
  navigation?: NotificationNavigation,
  fallbackType?: string
) => {
  console.log('🔍 handleNotificationNavigation called with:', { navigation, fallbackType });
  console.log('🔍 Navigation type:', typeof navigation);
  console.log('🔍 Navigation is null/undefined:', navigation === null || navigation === undefined);
  
  if (navigation) {
    const { route, params } = navigation;
    console.log('🔍 Navigation route:', route);
    console.log('🔍 Navigation params:', params);
    console.log('🔍 Params type:', typeof params);
    console.log('🔍 Params keys:', Object.keys(params || {}));
    
    switch (route) {
      case 'order-detail':
        if (params.orderId) {
          console.log('🔍 Navigating to order detail:', params.orderId);
          router.push({
            pathname: './order-detail/[id]',
            params: { id: params.orderId }
          } as any);
        } else {
          console.log('🔍 No orderId, navigating to purchased orders');
          router.push('./purchased-orders');
        }
        break;
        
      case 'product-detail':
        if (params.productId) {
          // Nếu có reviewId và scrollToReview, thêm params để scroll đến review
          if (params.reviewId && params.scrollToReview === 'true') {
            console.log('🔍 Navigating to product detail with review scroll:', {
              productId: params.productId,
              reviewId: params.reviewId,
              scrollToReview: params.scrollToReview
            });
            router.push({
              pathname: './product/[id]',
              params: { 
                id: params.productId,
                scrollToReview: 'true',
                reviewId: params.reviewId
              }
            } as any);
          } else {
            console.log('🔍 Navigating to product detail:', params.productId);
            router.push({
              pathname: './product/[id]',
              params: { id: params.productId }
            } as any);
          }
        } else {
          console.log('🔍 No productId, navigating to products');
          router.push('./products');
        }
        break;
        
      case 'news-detail':
        if (params.newsId) {
          console.log('🔍 Navigating to news detail:', params.newsId);
          router.push({
            pathname: './news-detail',
            params: { newsId: params.newsId }
          } as any);
        } else {
          console.log('🔍 No newsId, navigating to news');
          router.push('./news');
        }
        break;
        
      case 'voucher-list':
        console.log('🔍 Navigating to voucher list');
        router.push('./rewards');
        break;
        
      case 'review-list':
        // Có thể chuyển đến trang đánh giá hoặc sản phẩm
        if (params.productId) {
          console.log('🔍 Navigating to product for review list:', params.productId);
          router.push({
            pathname: './product/[id]',
            params: { id: params.productId }
          } as any);
        } else {
          console.log('🔍 No productId, navigating to products');
          router.push('./products');
        }
        break;
        
      case 'purchased-orders':
        console.log('🔍 Navigating to purchased orders');
        router.push('./purchased-orders');
        break;
        
      case 'profile':
        console.log('🔍 Navigating to profile');
        router.push('./profile');
        break;
        
      case 'home':
        console.log('🔍 Navigating to home');
        router.push('./home');
        break;
        
      default:
        // Fallback: chuyển về trang chủ
        console.log('🔍 Default fallback, navigating to home');
        router.push('./home');
        break;
    }
  } else {
    console.log('🔍 No navigation data, using fallback type:', fallbackType);
    // Nếu không có thông tin navigation, xử lý dựa trên type
    handleFallbackNavigation(fallbackType);
  }
};

/**
 * Xử lý navigation fallback dựa trên loại thông báo
 * @param type - Loại thông báo
 */
const handleFallbackNavigation = (type?: string) => {
  switch (type) {
    case 'order':
      router.push('./purchased-orders');
      break;
    case 'product':
      router.push('./products');
      break;
    case 'news':
      router.push('./news');
      break;
    case 'voucher':
      router.push('./rewards');
      break;
    case 'review':
      // Review type nên đi đến product detail nếu có relatedId
      router.push('./products');
      break;
    case 'promotion':
      router.push('./home');
      break;
    case 'system':
      router.push('./profile');
      break;
    default:
      router.push('./home');
      break;
  }
};

/**
 * Tạo thông tin navigation cho thông báo đơn hàng
 * @param orderId - ID đơn hàng
 */
export const createOrderNavigation = (orderId: string): NotificationNavigation => ({
  route: 'order-detail',
  params: { orderId }
});

/**
 * Tạo thông tin navigation cho thông báo sản phẩm
 * @param productId - ID sản phẩm
 */
export const createProductNavigation = (productId: string): NotificationNavigation => ({
  route: 'product-detail',
  params: { productId }
});

/**
 * Tạo thông tin navigation cho thông báo tin tức
 * @param newsId - ID tin tức
 */
export const createNewsNavigation = (newsId: string): NotificationNavigation => ({
  route: 'news-detail',
  params: { newsId }
});

/**
 * Tạo thông tin navigation cho thông báo voucher
 */
export const createVoucherNavigation = (): NotificationNavigation => ({
  route: 'voucher-list',
  params: {}
});

/**
 * Tạo thông tin navigation cho thông báo đánh giá
 * @param productId - ID sản phẩm (optional)
 */
export const createReviewNavigation = (productId?: string): NotificationNavigation => ({
  route: 'review-list',
  params: productId ? { productId } : {}
});

/**
 * Tạo thông tin navigation cho thông báo phản hồi đánh giá
 * @param productId - ID sản phẩm
 * @param reviewId - ID đánh giá
 */
export const createReviewResponseNavigation = (productId: string, reviewId: string): NotificationNavigation => ({
  route: 'product-detail',
  params: { 
    productId,
    reviewId,
    scrollToReview: 'true'
  }
});

/**
 * Tạo thông tin navigation cho thông báo khuyến mãi
 */
export const createPromotionNavigation = (): NotificationNavigation => ({
  route: 'home',
  params: {}
});

/**
 * Tạo thông tin navigation cho thông báo hệ thống
 */
export const createSystemNavigation = (): NotificationNavigation => ({
  route: 'profile',
  params: {}
});
