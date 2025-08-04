import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useCartStore } from '../../store/useCartStore';
import { getProductImages, formatPrice, getShortDescription } from '../../utils/productUtils';
import { useTheme } from '../../store/ThemeContext';

const { width } = Dimensions.get('window');

interface SectionItem {
  text: string
  hasBullet: boolean
}

interface Section {
  title: string
  items: SectionItem[]
}

const ProductScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#FF6B35',
    border: '#404040'
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#FF6B35',
    border: '#e0e0e0'
  };

  const { currentProduct, fetchProductById, fetchRelatedProducts, relatedProducts, isLoading } = useProductStore();
  const { isAuthenticated } = useAuthStore();
  const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoriteStore();
  const { addToCart } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCartModal, setShowCartModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load product data
  const loadProduct = async () => {
    if (id) {
      try {
        await fetchProductById(id as string);
        await fetchRelatedProducts(id as string);
      } catch (error) {
        console.error('Error loading product:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
      }
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Check favorite status when product loads
  useEffect(() => {
    if (currentProduct && isAuthenticated) {
      const token = useAuthStore.getState().token;
      if (token) {
        checkFavoriteStatus(currentProduct._id, token).then(({ isFavorite, favoriteId }) => {
          setIsFavorite(isFavorite);
          setFavoriteId(favoriteId);
        }).catch(error => {
          console.error('Error checking favorite status:', error);
        });
      }
    }
  }, [currentProduct, isAuthenticated]);

  const handleLoginPress = () => {
    Alert.alert(
      'Đăng nhập cần thiết',
      'Vui lòng đăng nhập để sử dụng tính năng này',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/(auth)/sign-in') }
      ]
    );
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      handleLoginPress();
      return;
    }

    if (!currentProduct) return;

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Lỗi', 'Token không hợp lệ');
        return;
      }

      if (isFavorite && favoriteId) {
        await removeFromFavorites(favoriteId, token);
        setIsFavorite(false);
        setFavoriteId(null);
        Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToFavorites(currentProduct, token);
        setIsFavorite(true);
        Alert.alert('Thành công', 'Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error handling favorites:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác');
    }
  };

  const handleAddToCart = async () => {
    if (!currentProduct) return;

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      await addToCart(token, currentProduct._id, quantity);
      Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
      setShowCartModal(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const handleBuyNow = async () => {
    if (!currentProduct) return;

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua hàng');
        return;
      }

      await addToCart(token, currentProduct._id, quantity);
      router.push('/checkout');
    } catch (error) {
      console.error('Error buying now:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện mua hàng');
    }
  };

  const renderSectionItem = (item: SectionItem, index: number) => (
    <View key={index} style={styles.sectionItem}>
      <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
        {item.hasBullet ? '•' : ''}
      </Text>
      <Text style={[styles.sectionItemText, { color: colors.text }]}>
        {item.text}
      </Text>
    </View>
  );

  const renderRelatedProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.relatedProductCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/product/${item._id}`)}
    >
      <Image
        source={{ uri: getProductImages(item)[0] !== 'https://via.placeholder.com/300x300?text=No+Image' 
          ? getProductImages(item)[0] 
          : 'https://via.placeholder.com/150x150?text=Related+Product' }}
        style={styles.relatedProductImage}
        resizeMode="cover"
      />
      <View style={styles.relatedProductInfo}>
        <Text style={[styles.relatedProductTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.relatedProductPrice, { color: colors.accent }]}>
          {formatPrice(item.priceProduct)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang tải thông tin sản phẩm...
        </Text>
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Không tìm thấy sản phẩm
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={loadProduct}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = getProductImages(currentProduct);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAddToFavorites} style={styles.favoriteButton}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ff4757" : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Product Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[selectedImageIndex] !== 'https://via.placeholder.com/300x300?text=No+Image' 
              ? images[selectedImageIndex] 
              : 'https://via.placeholder.com/400x400?text=Product+Image' }}
            style={styles.mainImage}
            resizeMode="cover"
            defaultSource={require('../../assets/images_sp/dau_ca_omega.png')}
            onError={(error) => {
              console.log('🔍 Product detail main Image load error:', error.nativeEvent.error);
            }}
            onLoad={() => {
              console.log('🔍 Product detail main Image loaded successfully');
            }}
          />
          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.selectedThumbnail
                  ]}
                >
                  <Image 
                    source={{ uri: image !== 'https://via.placeholder.com/300x300?text=No+Image' 
                      ? image 
                      : 'https://via.placeholder.com/80x80?text=Image' }} 
                    style={styles.thumbnailImage}
                    defaultSource={require('../../assets/images_sp/dau_ca_omega.png')}
                    onError={(error) => {
                      console.log('🔍 Product detail thumbnail Image load error:', error.nativeEvent.error);
                    }}
                    onLoad={() => {
                      console.log('🔍 Product detail thumbnail Image loaded successfully');
                    }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.productInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {currentProduct.title}
          </Text>
          
          <View style={styles.priceContainer}>
            {currentProduct.discount && currentProduct.discount > 0 ? (
              <>
                <Text style={[styles.price, { color: colors.accent }]}>
                  {formatPrice(currentProduct.priceProduct * (1 - currentProduct.discount / 100))}
                </Text>
                <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                  {formatPrice(currentProduct.priceProduct)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{currentProduct.discount}%</Text>
                </View>
              </>
            ) : (
              <Text style={[styles.price, { color: colors.accent }]}>
                {formatPrice(currentProduct.priceProduct)}
              </Text>
            )}
          </View>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {getShortDescription(currentProduct)}
          </Text>

          {/* Product Details */}
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Thương hiệu:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {typeof currentProduct.idBrand === 'object' && currentProduct.idBrand?.nameBrand 
                  ? currentProduct.idBrand.nameBrand 
                  : typeof currentProduct.idBrand === 'string' 
                    ? currentProduct.idBrand 
                    : 'Không xác định'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Danh mục:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {typeof currentProduct.idCategory === 'object' && currentProduct.idCategory?.nameCategory 
                  ? currentProduct.idCategory.nameCategory 
                  : typeof currentProduct.idCategory === 'string' 
                    ? currentProduct.idCategory 
                    : 'Không xác định'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Số lượng:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {currentProduct.quantity || 0} sản phẩm
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Trạng thái:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {currentProduct.status === 'active' ? 'Đang bán' : 'Tạm ngưng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Product Sections */}
        {currentProduct.sections && currentProduct.sections.length > 0 && (
          <View style={[styles.sectionsContainer, { backgroundColor: colors.card }]}>
            {currentProduct.sections.map((section: Section, index: number) => (
              <View key={index} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
                {section.items.map((item, itemIndex) => renderSectionItem(item, itemIndex))}
              </View>
            ))}
          </View>
        )}

        {/* Reviews Section */}
        <View style={[styles.reviewsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.reviewsTitle, { color: colors.text }]}>
            Đánh giá của khách hàng
          </Text>
          <View style={styles.reviewsContent}>
            <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
              Chưa có đánh giá nào cho sản phẩm này
            </Text>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <View style={[styles.relatedContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.relatedTitle, { color: colors.text }]}>
              Sản phẩm liên quan
            </Text>
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={handleDecreaseQuantity} style={styles.quantityButton}>
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: colors.text }]}>
            {quantity}
          </Text>
          <TouchableOpacity onPress={handleIncreaseQuantity} style={styles.quantityButton}>
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.addToCartButton, { backgroundColor: colors.accent }]}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.buyNowButton, { backgroundColor: colors.accent }]}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  imageContainer: {
    width: width,
    height: width, // For square images
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageList: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#FF6B35',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  productTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  discountText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  productDetails: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingBottom: 5,
  },
  sectionItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 24,
  },
  sectionItemText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  relatedContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingBottom: 5,
  },
  relatedProductCard: {
    width: 150,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  relatedProductImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  relatedProductInfo: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  relatedProductTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  relatedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  addToCartButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyNowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buyNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  relatedList: {
    paddingHorizontal: 10,
  },
  reviewsContainer: {
    marginTop: 10,
    padding: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  reviewsContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProductScreen;
