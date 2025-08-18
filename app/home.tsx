import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';    
import { Product } from '../types/product.type';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { getNewsList } from '../services/newsApi';
import { formatNewsDate } from '../utils/newsUtils';
import { getShortDescription, calculateOriginalPrice, getFullImageUrl, getProductImages } from '../utils/productUtils';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import DailyDealItem from '../modules/HomeScreen/DailyDealItem';
import TrendingProductItem from '../modules/HomeScreen/TrendingProductItem';
import HomeHeader from '../modules/HomeScreen/HomeHeader';
import HomeCategory from '../modules/HomeScreen/HomeCategory';
import HeaderSection from '../modules/HomeScreen/HeaderSection';
import NewsCard from '../modules/HomeScreen/NewsCard';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 32;

interface NewsItem {
  image: any;
  title: string;
  date: string;
  newsId?: string;
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState('00:00:00');
  const [refreshing, setRefreshing] = useState(false);
  const { products, isLoading: loading, error, fetchProducts, clearError } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();
  const { categories } = useCategoryStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const carouselImages = [
    { uri: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1579137/20-06-22-06-flash-sale-cuoi-tuan-tung-bung-thumb.jpg' },
    { uri: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1578821/13-06-15-06-mung-ngay-cua-cha-cham-cha-vui-khoe-thumb.jpg' },
  ];
  
  const handleViewAllProducts = () => {
    router.replace('./products');
  };

  // Tính toán thời gian còn lại đến nửa đêm
  const calculateTimeToMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Đặt thời gian đến 00:00:00 ngày hôm sau
    
    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cập nhật countdown timer mỗi giây
  useEffect(() => {
    const updateTimer = () => {
      setRemainingTime(calculateTimeToMidnight());
    };
    
    // Cập nhật ngay lập tức
    updateTimer();
    
    // Cập nhật mỗi giây
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load products using store - không cần đăng nhập
  const loadProducts = useCallback(async () => {
    try {
      // Giảm tải ban đầu: chỉ lấy 20 sản phẩm
      await fetchProducts({ limit: 20 });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      // Store will handle error state, no need to crash the app
    }
  }, [fetchProducts]);

  const handleRetryLoadProducts = () => {
    clearError();
    loadProducts();
  };

  const handleLoginPress = () => {
    router.replace('/(auth)/sign-in');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const getOriginalPrice = (price: number) => {
    // Giá gốc là giá từ API (không cần tăng)
    return formatPrice(price);
  };

  // Lọc sản phẩm có giảm giá (chỉ 10 sản phẩm đầu tiên)
  const discountedProducts = (products || [])
    .filter((product: Product) => product.discount && product.discount > 0)
    .slice(0, 10);

  // Hoàn thiện tính năng ưu đãi đặc biệt
  const saleProducts = discountedProducts.map((product: Product, index: number) => {
    const shortDescription = getShortDescription(product);
    
    // Tính toán giá thực tế từ API
    const numericPrice = typeof product.priceProduct === 'number' 
      ? product.priceProduct 
      : typeof product.priceProduct === 'string'
        ? parseFloat(String(product.priceProduct).replace(/[^0-9.-]+/g, ''))
        : 0;
    
    // Giá gốc là giá từ API
    const originalPrice = numericPrice;
    
    // Tính giá khuyến mãi dựa trên discount từ backend
    const discountPercent = product.discount || 0;
    const salePrice = originalPrice * (1 - discountPercent / 100);
    
    // Chỉ hiển thị giá khuyến mãi nếu có discount
    const displayPrice = discountPercent > 0 
      ? salePrice.toLocaleString('vi-VN') + ' ₫'
      : originalPrice.toLocaleString('vi-VN') + ' ₫';
      
    const displayOriginalPrice = discountPercent > 0 && originalPrice > 0 
      ? originalPrice.toLocaleString('vi-VN') + ' ₫'
      : '';

    // Sử dụng utility function để xử lý hình ảnh
    const productImages = getProductImages(product);
    const imageUrl = productImages.length > 0 ? productImages[0] : undefined;

    return {
      id: product._id || `product-${index}`,
      image: imageUrl,
      title: product.title || 'Tên sản phẩm',
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      discount: discountPercent > 0 ? `${discountPercent}% OFF` : '',
      description: shortDescription,
      rating: product.rating || 5,
      reviewCount: 123,
      onPress: () => {
        router.replace(`./product/${product._id}`);
      },
    };
  });

  useEffect(() => {
    // Load products khi component mount
    loadProducts();
    
    const interval = setInterval(() => {
      setRemainingTime(prevTime => {
        const time = prevTime.split(':');
        let hours = parseInt(time[0]);
        let minutes = parseInt(time[1]);
        let seconds = parseInt(time[2]);

        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
            }
          }
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Refetch khi màn hình Home quay lại focus
  useFocusEffect(
    React.useCallback(() => {
      loadProducts();
      return () => {};
    }, [loadProducts])
  );

  // Log products changes only when they actually change
  useEffect(() => {
    if (products.length > 0) {
      // Products loaded successfully
    }
  }, [products]);

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Load news from API
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setNewsLoading(true);
      const newsData = await getNewsList({ page: 1, limit: 3 });
      const formattedNews = newsData.map(news => ({
        image: { uri: news.image },
        title: news.title,
        date: formatNewsDate(news.createdAt),
        newsId: news._id
      }));
      setNewsItems(formattedNews);
    } catch (error) {
      console.error('Error loading news:', error);
      // Fallback to mock data if API fails
      setNewsItems([
        {
          image: { uri: 'https://via.placeholder.com/400x250/4CAF50/FFFFFF?text=Tin+tức' },
          title: 'Tin tức mới nhất về sức khỏe',
          date: new Date().toLocaleDateString('vi-VN'),
          newsId: '1'
        }
      ]);
    } finally {
      setNewsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}> {error} </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetryLoadProducts}>
            <Text style={[styles.retryButtonText, { color: colors.text }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <HomeHeader
        onMenuPress={() => console.log('Menu pressed')}
        onUserPress={() => router.push('./profile')}
        user={user}
        isAuthenticated={isAuthenticated}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try { await loadProducts(); } finally { setRefreshing(false); }
            }}
            tintColor={colors.accent}
          />
        }
      >
        <TouchableOpacity
          style={styles.searchBarButton}
          onPress={() => router.push('./search')}
        >
          <View style={styles.searchBarPlaceholder}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <Text style={[styles.searchBarText, { color: colors.textSecondary }]}>Tìm kiếm bất kỳ sản phẩm nào...</Text>
          </View>
        </TouchableOpacity>

        <HomeCategory
          onCategoryPress={(categoryId) => {
            console.log('Category pressed:', categoryId);
            // Navigate to products filtered by category
            router.push(`./products?category=${categoryId}`);
          }}
        />

        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / CAROUSEL_WIDTH);
              setCurrentCarouselIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {carouselImages.map((image, index) => (
              <Image key={index} source={image} style={styles.carouselImage} />
            ))}
          </ScrollView>
          <View style={styles.paginationContainer}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentCarouselIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        <HeaderSection
          title="Ưu đãi trong ngày"
          remainingTime={remainingTime}
          color="#3B82F6"
          onViewAll={handleViewAllProducts}
        />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải sản phẩm...</Text>
          </View>
        ) : (
          <View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={saleProducts}
              keyExtractor={(_, index) => `sale-product-${index}`}
              renderItem={({ item }) => (
                <DailyDealItem
                  image={item.image}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  discount={item.discount}
                  rating={5}
                  reviewCount={123}
                  onPress={item.onPress}
                />
              )}
              contentContainerStyle={styles.productList}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={5}
              removeClippedSubviews
            />
          </View>
        )}

        <View style={[styles.specialOfferSection, { backgroundColor: colors.card }]}>
            <Image
              source={require('../assets/images/special_offer.png')}
              style={styles.specialOfferImage}
              resizeMode="cover"
            />
            <View style={styles.specialOfferContent}>
              <Text style={[styles.specialOfferTitle, { color: colors.text }]}>Ưu đãi đặc biệt</Text>
              <Text style={[styles.specialOfferDescription, { color: colors.textSecondary }]}>Chúng tôi đảm bảo bạn nhận được ưu đãi mà bạn cần với giá tốt nhất.</Text>
            </View>
          </View>

        <View style={[styles.healthComboSection, { backgroundColor: colors.card }]}>
            <Image
              source={require('../assets/images/combo.png')}
              style={styles.healthComboImage}
              resizeMode="cover"
            />
            <View style={styles.healthComboContent}>
              <Text style={[styles.healthComboTitle, { color: colors.text }]}>Combo sức khỏe</Text>
              <Text style={[styles.healthComboDescription, { color: colors.textSecondary }]}>Có cơ hội nhận thưởng</Text>
              <TouchableOpacity style={styles.viewAllButtonSmall} onPress={handleViewAllProducts}>
                <Text style={[styles.viewAllTextSmall, { color: colors.accent }]}>Xem tất cả</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>

        <HeaderSection
          title="Sản phẩm thịnh hành"
          color="#FF3B30"
          onViewAll={handleViewAllProducts}
        />

        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={saleProducts.slice().reverse()}
            keyExtractor={(_, index) => `trending-product-${index}`}
            renderItem={({ item }) => (
              <TrendingProductItem
                image={item.image}
                title={item.title}
                price={item.price}
                originalPrice={item.originalPrice}
                discount={item.discount}
                onPress={item.onPress}
              />
            )}
            contentContainerStyle={styles.productList}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews
          />
        </View>

        {products.length > 2 && (
          <View style={styles.newArrivalsCard}>
             <Image
              source={require('../assets/images/hot_sale.png')}
              style={styles.newArrivalsImage}
              resizeMode="cover"
            />
           
            <View style={styles.newArrivalsContent}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.newArrivalsTitle, { color: colors.text }]}>Hàng mới về</Text>
                <Text style={[styles.newArrivalsDescription, { color: colors.textSecondary }]}>Tươi mát ngày hè, khỏe mạnh từ bên trong</Text>
              </View>
              <TouchableOpacity style={styles.viewAllButtonRed} onPress={handleViewAllProducts}>
                <Text style={[styles.viewAllTextRed, { color: colors.text }]}>Xem tất cả</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View>
          <TouchableOpacity 
            style={styles.newsHeader}
            onPress={() => router.push('/news')}
          >
            <Text style={[styles.newsHeaderTitle, { color: colors.text }]}>Bảng tin tức</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {newsLoading ? (
          <View style={styles.newsLoadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.newsLoadingText, { color: colors.textSecondary }]}>
              Đang tải tin tức...
            </Text>
          </View>
        ) : (
          newsItems.map((item, index) => (
            <NewsCard
              key={`news-${index}`}
              image={item.image}
              title={item.title}
              date={item.date}
              newsId={item.newsId}
            />
          ))
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  carouselContainer: {
    height: 200,
    position: 'relative',
    marginBottom: 16,
  },
  carouselImage: {
    width: width - 32,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  productList: {
    paddingRight: 15,
    marginBottom: 16,
  },
  specialOfferSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  specialOfferImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  specialOfferContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  specialOfferTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  specialOfferDescription: {
    fontSize: 14,
    color: '#666',
  },
  healthComboSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    alignContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  healthComboImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  healthComboContent: {
    flex: 1,
    marginLeft: 15,
  },
  healthComboTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  healthComboDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  viewAllButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  viewAllTextSmall: {
    color: '#4A90E2',
    fontSize: 13,
    marginRight: 2,
  },
  viewAllButtonRed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewAllTextRed: {
    color: 'white',
    fontSize: 14,
    marginRight: 2,
  },
  newArrivalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newArrivalsImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  newArrivalsContent: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newArrivalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 6,
  },
  newArrivalsDescription: {
    fontSize: 14,
    color: 'black',
    marginBottom: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  newsHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomSpace: {
    height: 30,
  },
  searchBarButton: {
    paddingTop: 15,
    paddingBottom: 10,
  },
  searchBarPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBarText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '22%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  productsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginPromptContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginPromptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  newsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  newsLoadingText: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default HomeScreen; 