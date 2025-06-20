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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_PRODUCT_SAMPLE } from '../../constants/app.constant';
import { Product } from '../../types/product.type';
import DailyDealItem from '../../modules/HomeScreen/DailyDealItem';
import TrendingProductItem from '../../modules/HomeScreen/TrendingProductItem';
import HomeHeader from '../../modules/HomeScreen/HomeHeader';
import HomeCategory from '../../modules/HomeScreen/HomeCategory';
import HeaderSection from '../../modules/HomeScreen/HeaderSection';
import NewsCard from '../../modules/HomeScreen/NewsCard';

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

  const carouselImages = [
    require('../../assets/images_sp/dau_ca_omega.png'),
    require('../../assets/images_sp/magie_blackmores.png'),
  ];
  const handleViewAllProducts = () => {
    router.push('../products');
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

  const saleProducts = LIST_PRODUCT_SAMPLE.map((product: Product, index: number) => {
    const shortDescription = getShortDescription(product.sections);
    const basePrice = parseInt(product.price.replace(/[^\d]/g, '')) || 899000;
    const originalPrice = Math.round(basePrice * 1.2);

    return {
      id: product.id || `product-${index}`,
      image: product.images && product.images[0] ? product.images[0] : require('../../assets/images_sp/dau_ca_omega.png'),
      title: product.title || 'Tên sản phẩm',
      price: product.price || '899.000 ₫',
      originalPrice: `${(originalPrice / 1000).toFixed(0)}.000 ₫`,
      discount: '40% OFF',
      description: shortDescription,
      rating: product.rating || 5,
      reviewCount: 123,
    };
  });

  useEffect(() => {
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

  const newsItems: NewsItem[] = [
    {
      image: require('../../assets/images_sp/dau_ca_omega.png'),
      title: '5 cách tăng cường hệ miễn dịch trong mùa dịch',
      date: '10/06/2025'
    },
    {
      image: require('../../assets/images_sp/magie_blackmores.png'),
      title: 'Vitamin D và vai trò quan trọng đối với sức khỏe xương',
      date: '08/06/2025'
    },
    {
      image: require('../../assets/images_sp/dau_ca_omega.png'),
      title: 'Omega-3: Lợi ích và nguồn bổ sung tốt nhất',
      date: '05/06/2025'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <HomeHeader
        onMenuPress={() => console.log('Menu pressed')}
        onUserPress={() => router.push('./profile')}
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
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <Text style={styles.searchBarText}>Tìm kiếm bất kỳ sản phẩm nào...</Text>
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
              />
            )}
            contentContainerStyle={styles.productList}
          />
        </View>

        <View style={styles.specialOfferSection}>
          <Image
            source={require('../../assets/images_sp/dau_ca_omega.png')}
            style={styles.specialOfferImage}
          />
          <View style={styles.specialOfferContent}>
            <Text style={styles.specialOfferTitle}>Ưu đãi đặc biệt</Text>
            <Text style={styles.specialOfferDescription}>
              Chúng tôi đảm bảo bạn nhận được ưu đãi mà bạn cần với giá tốt nhất.
            </Text>
          </View>
        </View>

        <View style={styles.healthComboSection}>
          <Image
            source={require('../../assets/images_sp/magie_blackmores.png')}
            style={styles.healthComboImage}
          />
          <View style={styles.healthComboContent}>
            <Text style={styles.healthComboTitle}>Combo sức khỏe</Text>
            <Text style={styles.healthComboDescription}>
              Có cơ hội nhận thưởng
            </Text>
            <TouchableOpacity style={styles.viewAllButtonSmall} onPress={handleViewAllProducts}>
              <Text style={styles.viewAllTextSmall}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

        <HeaderSection
          title="Sản phẩm thịnh hành"
          remainingTime="22h 55m 20s còn lại"
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
                discount={'40% OFF'}
              />
            )}
            contentContainerStyle={styles.productList}
          />
        </View>

        <View style={styles.newArrivalsCard}>
          <Image
            source={require('../../assets/images_sp/dau_ca_omega.png')}
            style={styles.newArrivalsImage}
          />
          <View style={styles.newArrivalsContent}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.newArrivalsTitle}>Hàng mới về</Text>
              <Text style={styles.newArrivalsDescription}>
                Tươi mát ngày hè, khỏe mạnh từ bên trong
              </Text>
            </View>
            <TouchableOpacity style={styles.viewAllButtonRed} onPress={handleViewAllProducts}>
              <Text style={styles.viewAllTextRed}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View style={styles.newsHeader}>
            <Text style={styles.newsHeaderTitle}>Bảng tin tức</Text>
            <Ionicons name="chevron-forward" size={18} color="#333" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
