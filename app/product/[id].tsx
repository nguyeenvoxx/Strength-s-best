import { StyleSheet, Text, View, ScrollView, Dimensions, Image, TouchableOpacity, ImageSourcePropType, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { PRODUCT_ITEM_SAMPLE } from '../../constants/app.constant'
import { useProductStore } from '../../store/useProductStore'
import { useAuthStore } from '../../store/useAuthStore'
import { transformApiProductToProduct, getFullImageUrl, formatPrice } from '../../utils/productUtils'
import { getPlatformContainerStyle } from '../../utils/platformUtils'
import { Product } from '../../types/product.type'
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window')

interface SectionItem {
  text: string
  hasBullet: boolean
}

interface Section {
  title: string
  items: SectionItem[]
}

const ProductScreen = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { currentProduct: product, isLoading: loading, error, fetchProductById, clearError } = useProductStore()
  const { isAuthenticated } = useAuthStore()

  // Fetch product detail từ API
  const loadProduct = async () => {
    if (!id || typeof id !== 'string') {
      return
    }

    if (!isAuthenticated) {
      console.log('User not authenticated, cannot fetch product details')
      return
    }

    try {
      await fetchProductById(id)
    } catch (err: any) {
      console.error('Error fetching product:', err)
      // Store will handle error state and fallback
    }
  }

  const handleLoginPress = () => {
    router.push('/(auth)/sign-in')
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.centered]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Ionicons name="lock-closed-outline" size={64} color="#FF6B35" />
        <Text style={styles.loginPromptTitle}>Đăng nhập để xem chi tiết sản phẩm</Text>
        <Text style={styles.loginPromptText}>Vui lòng đăng nhập để xem thông tin chi tiết về sản phẩm này</Text>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    )
  }

  if (error && !product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => { clearError(); loadProduct(); }}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const productImages = (product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : []) as ImageSourcePropType[]
  const productTitle = product.title
  const rating = product.rating || 0
  const price = product.price
  const sections: Section[] = (product.sections || []).map((section: any) => ({
    title: section.title,
    items: section.items.map((text: any, idx: any) => {
      const isNoBullet = text.endsWith(':') || idx === 0;
      return { text, hasBullet: !isNoBullet };
    })
  }))

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffset / width)
    setCurrentImageIndex(index)
  }

  const handleAddToCart = async () => {
    const cartItem = {
      id: product.id,
      name: product.title,
      price: Number(product.price.toString().replace(/[^\d]/g, '')), quantity: 1, // chuyển đổi giá sang số
      image: product.images[0],
      text: 'Neque porro...' // mô tả đơn giản
    };

    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      const index = cart.findIndex((item: any) => item.id === cartItem.id);
      if (index !== -1) {
        cart[index].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      router.push('/(tabs)/cart'); // đúng với cấu trúc folder bạn đang dùng
    } catch (err) {
      console.error('Lỗi thêm sản phẩm vào giỏ:', err);
    }
  };
  const renderSectionItem = (item: SectionItem, index: number) => {
    return (
      <View key={index} style={styles.sectionItem}>
        {item.hasBullet && <Text style={styles.bullet}>• </Text>}
        <Text style={[styles.itemText, !item.hasBullet && styles.itemTextNoBullet]}>
          {item.text}
        </Text>
      </View>
    )
  }
  return (
    <ScrollView style={[styles.container, getPlatformContainerStyle()]} showsVerticalScrollIndicator={false}>
      {/* Carousel */}
      <View style={styles.carouselContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        {/* Heart Button */}
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={24} color="#000000" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {productImages.length > 0 ? productImages.map((image, index) => {
            const imageSource = product.images
            return (
              <Image 
                key={index} 
                source={{ uri: imageSource[index] }} 
                style={styles.carouselImage} 
              />
            );
          }) : (
            <View style={[styles.carouselImage, styles.noImageContainer]}>
              <Text style={styles.noImageText}>Không có hình ảnh</Text>
            </View>
          )}
        </ScrollView>

        {/* Dots indicator */}
        {productImages.length > 1 && (
          <View style={styles.dotsContainer}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Title and Rating */}
      <View style={styles.titleContainer}>
        <View style={styles.titleRatingRow}>
          <Text style={styles.title}>{productTitle}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Price Button */}
        <TouchableOpacity style={styles.priceButton} onPress={handleAddToCart}>
          <Text style={styles.priceText}>{price}</Text>
        </TouchableOpacity>
      </View>

      {/* Description Sections */}
      <View style={styles.sectionsContainer}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSectionItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carouselContainer: {
    height: 300,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heartButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titleContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#F57F17',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '600',
  },
  priceButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 15,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    paddingBottom: 5,
  },
  sectionContent: {
    paddingLeft: 5,
  },
  sectionItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
    lineHeight: 24,
  },
  itemText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    flex: 1,
  },
  itemTextNoBullet: {
    fontStyle: 'italic',
    color: '#777777',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductScreen;
