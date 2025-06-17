import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type RootStackParamList = {
  QRCodePayment: undefined;
  Home: undefined;
  Profile: undefined;
  Cart: undefined;
  OrderSummary: undefined;
  PaymentSuccess: undefined;
}

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
}
from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_PRODUCT_SAMPLE } from '../constants/app.constant';
import { Product } from '../types/product.type';
import DailyDealItem from '../modules/HomeScreen/DailyDealItem';
import TrendingProductItem from '../modules/HomeScreen/TrendingProductItem';
import HomeHeader from '../modules/HomeScreen/HomeHeader';
import HomeCategory from '../modules/HomeScreen/HomeCategory';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 32; // Account for horizontal padding

interface NewsItemProps {
  image: any;
  title: string;
  date: string;
}

interface NewsItem {
  image: any;
  title: string;
  date: string;
}

interface Section {
  title: string;
  remainingTime?: string;
  color?: string;
}

const HeaderSection: React.FC<Section> = ({ title, remainingTime, color }) => {

  return (
    <View style={[styles.sectionHeader, { backgroundColor: color }]}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.timerContainer}>
          <Ionicons name="time-outline" size={16} color="#FFFFFF" />
          <Text style={styles.timerText}>{remainingTime}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>Xem tất cả</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const NewsCard: React.FC<NewsItemProps> = ({ image, title, date }) => {
  return (
    <TouchableOpacity style={styles.newsCard}>
      <Image source={image} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <Text numberOfLines={2} style={styles.newsTitle}>{title}</Text>
        <Text style={styles.newsDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState("23:59:59");
  const carouselImages = [
    require('../images_sp/dau_ca_omega.png'),
    require('../images_sp/magie_blackmores.png'),
  ];

  function getShortDescription(sections: any[]): string {
    if (!sections || !Array.isArray(sections)) return '';
    const overview = sections.find(s => s.title === 'Tổng quan');
    if (overview && overview.items && overview.items.length > 0) {
      return overview.items[0];
    }
    if (sections[0] && sections[0].items && sections[0].items.length > 0) {
      return sections[0].items[0];
    }
    return '';
  }

  const saleProducts = LIST_PRODUCT_SAMPLE.map((product: Product) => ({
    image: product.images[0],
    title: product.title,
    price: product.price,
    originalPrice: `${parseInt(product.price.replace(/[^\d]/g, '')) * 1.2}.000 ₫`,
    discount: '40% OFF',
    description: getShortDescription(product.sections),
    rating: product.rating || 5,
    reviewCount: 123,
  }));
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
      image: require('../images_sp/dau_ca_omega.png'),
      title: '5 cách tăng cường hệ miễn dịch trong mùa dịch',
      date: '10/06/2025'
    },
    {
      image: require('../images_sp/magie_blackmores.png'),
      title: 'Vitamin D và vai trò quan trọng đối với sức khỏe xương',
      date: '08/06/2025'
    },
    {
      image: require('../images_sp/dau_ca_omega.png'),
      title: 'Omega-3: Lợi ích và nguồn bổ sung tốt nhất',
      date: '05/06/2025'
    }
  ];
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <HomeHeader
        onMenuPress={() => console.log('Menu pressed')}
        onUserPress={() => console.log('User pressed')}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Search Bar */}
        <TouchableOpacity
          style={styles.searchBarButton}
        >
          <View style={styles.searchBarPlaceholder}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <Text style={styles.searchBarText}>Tìm kiếm bất kỳ sản phẩm nào...</Text>
          </View></TouchableOpacity>

        {/* Category Section */}
        <HomeCategory
          onCategoryPress={(categoryId) => console.log('Category pressed:', categoryId)}
        />

        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false} onScroll={(event) => {
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
          {/* Dots indicator */}
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
        {/* Daily Deals Section - Header */}
        <HeaderSection
          title="Ưu đãi trong ngày"
          remainingTime={remainingTime}
          color="#3B82F6" // Blue color
        />
        {/* Daily Deals Products */}
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
                description={item.description || 'Mô tả ngắn sản phẩm'}
                price={item.price}
                originalPrice={item.originalPrice}
                discount={'40% OFF'}
                rating={5}
                reviewCount={123}
              />
            )}
            contentContainerStyle={styles.productList}
          />
        </View>        {/* Special Offer Section */}
        <View style={styles.specialOfferSection}>
          <Image
            source={require('../images_sp/dau_ca_omega.png')}
            style={styles.specialOfferImage}
          />
          <View style={styles.specialOfferContent}>
            <Text style={styles.specialOfferTitle}>Ưu đãi đặc biệt</Text>
            <Text style={styles.specialOfferDescription}>
              Chúng tôi đảm bảo bạn nhận được ưu đãi mà bạn cần với giá tốt nhất.
            </Text>
          </View>
        </View>

        {/* Health Combo Section */}
        <View style={styles.healthComboSection}>
          <Image
            source={require('../images_sp/magie_blackmores.png')}
            style={styles.healthComboImage}
          />
          <View style={styles.healthComboContent}>
            <Text style={styles.healthComboTitle}>Combo sức khỏe</Text>
            <Text style={styles.healthComboDescription}>
              Có cơ hội nhận thưởng
            </Text>
            <TouchableOpacity style={styles.viewAllButtonSmall}>
              <Text style={styles.viewAllTextSmall}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
        <HeaderSection
          title="Sản phẩm thịnh hành"
          remainingTime="22h 55m 20s còn lại"
          color="#FF3B30"
        />

        {/* Trending Products Items */}
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
        </View>        {/* New Arrivals Card */}
        <View style={styles.newArrivalsCard}>
          <Image
            source={require('../images_sp/dau_ca_omega.png')}
            style={styles.newArrivalsImage}
          />
          <View style={styles.newArrivalsContent}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.newArrivalsTitle}>Hàng mới về</Text>
              <Text style={styles.newArrivalsDescription}>
                Tươi mát ngày hè, khỏe mạnh từ bên trong
              </Text>
            </View>
            <TouchableOpacity style={styles.viewAllButtonRed}>
              <Text style={styles.viewAllTextRed}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* News Section */}
        <View>
          <View style={styles.newsHeader}>
            <Text style={styles.newsHeaderTitle}>Bảng tin tức</Text>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </View>


        </View>

        {/* News Items */}
        {newsItems.map((item, index) => (
          <NewsCard
            key={`news-${index}`}
            image={item.image}
            title={item.title}
            date={item.date}
          />
        ))}        {/* Bottom Space for better scrolling experience */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.MenuTab}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Home')}>
          <Image source={require('../images/home_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Image source={require('../images/heart_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Cart')}>
          <Image source={require('../images/shopping-cart_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Image source={require('../images/search_icon.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../images/settings_icon.png')} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  MenuTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  menuButton: {
    
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  sectionHeader: {
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    marginVertical: 16
  },
  sectionTitleContainer: {
    alignItems: 'center',
    gap: 8
  }, sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 2,
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
  newsCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 12,
  }, newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
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
  }
});

export default HomeScreen;