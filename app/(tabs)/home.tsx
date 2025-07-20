import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_PRODUCT_SAMPLE } from '../../constants/app.constant';
import { Product } from '../../types/product.type';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { transformApiProductToProduct, getShortDescription, calculateOriginalPrice, getFullImageUrl } from '../../utils/productUtils';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import DailyDealItem from '../../modules/HomeScreen/DailyDealItem';
import TrendingProductItem from '../../modules/HomeScreen/TrendingProductItem';
import HomeHeader from '../../modules/HomeScreen/HomeHeader';
import HomeCategory from '../../modules/HomeScreen/HomeCategory';
import HeaderSection from '../../modules/HomeScreen/HeaderSection';
import NewsCard from '../../modules/HomeScreen/NewsCard';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 32;

interface NewsItem {
  image: any;
  title: string;
  date: string;
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState('22:55:20');
  const { products, isLoading: loading, error, fetchProducts, clearError } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const carouselImages = [
    { uri: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1579137/20-06-22-06-flash-sale-cuoi-tuan-tung-bung-thumb.jpg' },
    { uri: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1578821/13-06-15-06-mung-ngay-cua-cha-cham-cha-vui-khoe-thumb.jpg' },
  ];
  const handleViewAllProducts = () => {
    router.push('../products');
  };

  // Load products using store
  const loadProducts = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping product fetch');
      return;
    }
    
    try {
      await fetchProducts(20);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      // Store will handle error state, no need to crash the app
    }
  };

  const handleRetryLoadProducts = () => {
    clearError();
    loadProducts();
  };

  const handleLoginPress = () => {
    router.push('/(auth)/sign-in');
  };

  function getShortDescription(sections: any[]): string {
    if (!sections || !Array.isArray(sections)) return 'Mô tả ngắn sản phẩm';
    const overview = sections.find(s => s && s.title === 'Tổng quan');
    if (overview && overview.items && Array.isArray(overview.items) && overview.items.length > 0) {
      const item = overview.items[0];
      return (typeof item === 'string' && item) ? item : 'Mô tả ngắn sản phẩm';
    }
    if (sections[0] && sections[0].items && Array.isArray(sections[0].items) && sections[0].items.length > 0) {
      const item = sections[0].items[0];
      return (typeof item === 'string' && item) ? item : 'Mô tả ngắn sản phẩm';
    }
    return 'Mô tả ngắn sản phẩm';
  }

  // Debug logs moved to useEffect to prevent spam
  
  const saleProducts = products.map((product: Product, index: number) => {
    const shortDescription = getShortDescription(product.sections);
    const originalPrice = calculateOriginalPrice(product.price, 40);

    return {
      id: product.id || `product-${index}`,
      image: product.images && product.images[0] ? 
        (typeof product.images[0] === 'string' && product.images[0].startsWith('http') ? 
          { uri: product.images[0] } : 
          product.images[0]
        ) : require('../../assets/images_sp/dau_ca_omega.png'),
      title: product.title || 'Tên sản phẩm',
      price: product.price || '899.000 ₫',
      originalPrice: originalPrice,
      discount: '40% OFF',
      description: shortDescription,
      rating: product.rating || 5,
      reviewCount: 123,
      onPress: () => {
        console.log('🔍 DEBUG: onPress được gọi cho sản phẩm:', product.id, product.title);
        console.log('🔍 DEBUG: Điều hướng đến:', `/product/${product.id}`);
        router.push(`/product/${product.id}`);
      },
    };
  });

  useEffect(() => {
    // Load products khi component mount
    console.log('🔍 DEBUG Home: Component mounted, isAuthenticated =', isAuthenticated);
    console.log('🔍 DEBUG Home: Initial products.length =', products.length);
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

  // Log products changes only when they actually change
  useEffect(() => {
    if (products.length > 0) {
      console.log('🔍 DEBUG Home: Products updated, length =', products.length);
      console.log('🔍 DEBUG Home: Products =', products.slice(0, 2)); // Only log first 2 products to avoid spam
    }
  }, [products]);

  const newsItems: NewsItem[] = [
    {
      image: { uri: 'https://cdn2.tuoitre.vn/thumb_w/730/471584752817336320/2025/6/24/ban-sao-ban-sao-thuoc-hiem-17231781483331926815331-17507593761622147355194.jpg' },
      title: 'Nhiều bệnh nhân nguy kịch tại TP.HCM được cứu sống nhờ điều phối thuốc cấp cứu kịp thời',
      date: '10/06/2025'
    },
    {
      image: { uri: 'https://cdn2.tuoitre.vn/thumb_w/730/471584752817336320/2025/6/23/23-6-hon-1000-nguoi-tham-gia-dong-dien-yoga-quoc-te-da-nang-2025-1-17506916493471544355776.jpg' },
      title: 'Yoga và những bài tập giúp tăng cường sức khỏe của não',
      date: '08/06/2025'
    },
    {
      image: { uri: 'https://cdn2.tuoitre.vn/thumb_w/730/471584752817336320/2024/6/29/quochoi-1719624459812418575638.jpg' },
      title: 'Quốc hội họp riêng nghe trình công tác nhân sự',
      date: '05/06/2025'
    }
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B35" />
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
          onCategoryPress={(categoryId) => console.log('Category pressed:', categoryId)}
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
        
        {!isAuthenticated ? (
          <View style={styles.loginPromptContainer}>
            <Ionicons name="lock-closed-outline" size={48} color="#FF6B35" />
            <Text style={[styles.loginPromptTitle, { color: colors.text }]}>Đăng nhập để xem sản phẩm</Text>
            <Text style={[styles.loginPromptText, { color: colors.textSecondary }]}>Vui lòng đăng nhập để khám phá các sản phẩm tuyệt vời của chúng tôi</Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
              <Text style={[styles.loginButtonText, { color: colors.text }]}>Đăng nhập ngay</Text>
            </TouchableOpacity>
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
                  discount={'40% OFF'}
                  rating={5}
                  reviewCount={123}
                  onPress={item.onPress}
                />
            )}
             contentContainerStyle={styles.productList}
           />
         </View>
        )}

        <View style={[styles.specialOfferSection, { backgroundColor: colors.card }]}>
          <Image
            source={require('../../assets/images/special_offer.png')}
            style={styles.specialOfferImage}
          />
          <View style={styles.specialOfferContent}>
            <Text style={[styles.specialOfferTitle, { color: colors.text }]}>Ưu đãi đặc biệt</Text>
            <Text style={[styles.specialOfferDescription, { color: colors.textSecondary }]}>Chúng tôi đảm bảo bạn nhận được ưu đãi mà bạn cần với giá tốt nhất.</Text>
          </View>
        </View>

        <View style={[styles.healthComboSection, { backgroundColor: colors.card }]}>
          <Image
            source={require('../../assets/images/combo.png')}
            style={styles.healthComboImage}
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
          remainingTime="22h 55m 20s còn lại"
          color="#FF3B30"
          onViewAll={handleViewAllProducts}
        />

        {!isAuthenticated ? (
          <View style={styles.loginPromptContainer}>
            <Ionicons name="trending-up-outline" size={48} color="#FF3B30" />
            <Text style={[styles.loginPromptTitle, { color: colors.text }]}>Khám phá sản phẩm thịnh hành</Text>
            <Text style={[styles.loginPromptText, { color: colors.textSecondary }]}>Đăng nhập để xem các sản phẩm được yêu thích nhất</Text>
            <TouchableOpacity style={[styles.loginButton, {backgroundColor: '#FF3B30'}]} onPress={handleLoginPress}>
              <Text style={[styles.loginButtonText, { color: colors.text }]}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
                  discount={'40% OFF'}
                  onPress={item.onPress}
                />
              )}
              contentContainerStyle={styles.productList}
            />
          </View>
        )}

        <View style={styles.newArrivalsCard}>
          <Image
            source={require('../../assets/images/hot_sale.png')}
            style={styles.newArrivalsImage}
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

        <View>
          <View style={styles.newsHeader}>
            <Text style={[styles.newsHeaderTitle, { color: colors.text }]}>Bảng tin tức</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text} />
          </View>
        </View>

        {newsItems.map((item, index) => (
          <NewsCard
            key={`news-${index}`}
            image={item.image}
            title={item.title}
            date={item.date}
          />))}

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
    backgroundColor: '#FF6B35',
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
    backgroundColor: '#FF6B35',
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
});

export default HomeScreen;
