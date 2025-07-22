import { StyleSheet, Text, View, ScrollView, Dimensions, Image, TouchableOpacity, ImageSourcePropType, ActivityIndicator, Alert, Modal, TouchableWithoutFeedback, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { PRODUCT_ITEM_SAMPLE } from '../../constants/app.constant'
import { useProductStore } from '../../store/useProductStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '../../store/useCartStore'
import { transformApiProductToProduct, getFullImageUrl, formatPrice } from '../../utils/productUtils'
import { getPlatformContainerStyle } from '../../utils/platformUtils'
import { Product } from '../../types/product.type'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useFavoriteStore } from '../../store/useFavoriteStore'
import Feather from '@expo/vector-icons/Feather';

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
  const [showCartModal, setShowCartModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { currentProduct: product, isLoading: loading, error, fetchProductById, clearError } = useProductStore()
  const { isAuthenticated, token } = useAuthStore()
  const { addToCart, loading: cartLoading, error: cartError } = useCartStore()



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

  const { addToFavorites, favorites } = useFavoriteStore();
  const handleAddToFavorites = async () => {
    if (!token) {
      Alert.alert('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    if (!product) {
      Alert.alert('Không tìm thấy sản phẩm để thêm vào yêu thích');
      return;
    }

    try {
      await addToFavorites(product, token);
      Alert.alert('Đã thêm vào yêu thích!');
    } catch (err) {
      console.error('Lỗi thêm yêu thích:', err);
    }
  };
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
  const price = product.price || 0
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
  // Hàm mở modal giỏ hàng
  const handleOpenCartModal = () => {
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    setQuantity(1);
    setShowCartModal(true);
  };

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    if (!product) {
      Alert.alert('Lỗi', 'Không tìm thấy sản phẩm');
      return;
    }

    try {
      await addToCart(token, product._id, quantity);
      setShowCartModal(false);
      Alert.alert(
        'Thành công',
        `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`,
        [
          { text: 'Tiếp tục mua sắm', style: 'cancel' },
          { text: 'Xem giỏ hàng', onPress: () => router.push('/(tabs)/cart') }
        ]
      );
    } catch (error) {
      console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server');
    }
  };

  // Hàm tăng số lượng
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Hàm giảm số lượng
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Hàm xử lý thay đổi số lượng từ input
  const handleQuantityChange = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };
  const handleBuyNow = async () => {
    try {
      await AsyncStorage.setItem('buyNowProduct', JSON.stringify(product));
      router.push('/checkout');
    } catch (err) {
      console.error('Lỗi mua ngay:', err);
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
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, getPlatformContainerStyle()]} showsVerticalScrollIndicator={false}>
      {/* Carousel */}
      <View style={styles.carouselContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          top: 20,
          right: 15,
          zIndex: 10
        }}>
          {/* Icon tim */}
          <TouchableOpacity style={styles.heartButton} onPress={handleAddToFavorites}>
            <Ionicons
              name={favorites.some(fav => fav._id === product._id) ? 'heart' : 'heart-outline'}
              size={24}
              color={favorites.some(fav => fav._id === product._id) ? 'red' : '#000000'}
            />
          </TouchableOpacity>

          {/* Icon giỏ hàng */}
          <TouchableOpacity style={[styles.heartButton, { marginLeft: 10 }]} onPress={handleOpenCartModal}>
            <Fontisto name="shopping-basket-add" size={20} color="#000000" />
          </TouchableOpacity>
        </View>


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
        <TouchableOpacity style={styles.priceButton}>
          <Text style={styles.priceText}>{price}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 30, gap: 10 }}>
        {/* nut mua ngay*/}
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: '#469B43', padding: 14, borderRadius: 8 }}
          onPress={handleBuyNow}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Mua ngay</Text>
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

      {/* Cart Modal */}
      <Modal transparent visible={showCartModal} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowCartModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Thêm vào giỏ hàng</Text>
                  <TouchableOpacity onPress={() => setShowCartModal(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.productInfo}>
                  <Image
                    source={{ uri: product.images[0] || product.image }}
                    style={styles.modalProductImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.modalProductTitle}>{product.title}</Text>
                    <Text style={styles.modalProductPrice}>{product.price}</Text>
                  </View>
                </View>

                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Số lượng:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={handleDecreaseQuantity}
                    >
                      <Ionicons name="remove" size={20} color="#666" />
                    </TouchableOpacity>

                    <TextInput
                      style={styles.quantityInput}
                      value={quantity.toString()}
                      onChangeText={handleQuantityChange}
                      keyboardType="numeric"
                      textAlign="center"
                    />

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={handleIncreaseQuantity}
                    >
                      <Ionicons name="add" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={handleAddToCart}
                >
                  <Text style={styles.addToCartButtonText}>
                    Thêm {quantity} vào giỏ hàng
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </ScrollView>

    {/* Navigation Tabs */}
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => router.push('/(tabs)/home')}
      >
        <Image 
          source={require('../../assets/images/home_icon.png')} 
          style={styles.tabIcon} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => router.push('/(tabs)/favorite')}
      >
        <Image 
          source={require('../../assets/images/heart_icon.png')} 
          style={styles.tabIcon} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, styles.cartTab]} 
        onPress={() => router.push('/(tabs)/cart')}
      >
        <View style={styles.cartTabIcon}>
          <Feather name="shopping-cart" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => router.push('/(tabs)/search')}
      >
        <Image 
          source={require('../../assets/images/search_icon.png')} 
          style={styles.tabIcon} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => router.push('/(tabs)/profile')}
      >
        <Image 
          source={require('../../assets/images/settings_icon.png')} 
          style={styles.tabIcon} 
        />
      </TouchableOpacity>
    </View>
  </View>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  modalProductTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  modalProductPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#469B43',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    paddingBottom: 10,
    height: 80,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
  cartTab: {
    marginBottom: 20,
  },
  cartTabIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#469B43',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});

export default ProductScreen;
