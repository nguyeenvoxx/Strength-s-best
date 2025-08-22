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
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useCartStore } from '../../store/useCartStore';
import { getProductImages, formatPrice, getShortDescription } from '../../utils/productUtils';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';
import { getReviewsByProduct, likeReview, unlikeReview, checkLikeStatus } from '../../services/reviewApi';
import { useRealtimeUpdates } from '../../services/realtimeApi';

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
  const { id, scrollToReview, reviewId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const { isAuthenticated } = useAuthStore();
  const { currentProduct, fetchProductById, fetchRelatedProducts, relatedProducts, isLoading } = useProductStore();
  const { addToFavorites, removeFromFavorites, checkFavoriteStatus } = useFavoriteStore();
  const { addToCart } = useCartStore();
  const { subscribe, unsubscribe, triggerEvent } = useRealtimeUpdates();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [confirmedLargeQuantity, setConfirmedLargeQuantity] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [hasScrolledToReview, setHasScrolledToReview] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const reviewRefs = useRef<{ [key: string]: any }>({});

  // Xử lý reviewId từ params
  const targetReviewId = Array.isArray(reviewId) ? reviewId[0] : reviewId;

  // Debug logs để kiểm tra params
  console.log('🔍 Product Screen Params:', { id, scrollToReview, reviewId, targetReviewId });
  console.log('🔍 Reviews loaded:', reviews.length);
  console.log('🔍 Show all reviews:', showAllReviews);

  // Tính toán giới hạn tối đa cho quantity - chỉ giới hạn theo tồn kho
  const maxQuantity = currentProduct ? (currentProduct.quantity || 0) : 0;

  // Tính rating trung bình từ reviews
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Load product data
  const loadProduct = async () => {
    if (id) {
      try {
        await fetchProductById(id as string);
        await fetchRelatedProducts(id as string);
        await loadReviews();
      } catch (error: any) {
        console.error('Error loading product:', error);
        Alert.alert('Thông báo', 'Không thể tải thông tin sản phẩm');
      }
    }
  };

  // Load reviews
  const loadReviews = async () => {
    if (!id) return;
    
    try {
      setReviewsLoading(true);
      const response = await getReviewsByProduct(id as string, 1, 10);
      setReviews(response.reviews || []);
      
      // Load like status cho từng review (chỉ khi đã đăng nhập)
      if (isAuthenticated) {
        const token = useAuthStore.getState().token;
        if (token) {
          const likedSet = new Set<string>();
          for (const review of response.reviews || []) {
            try {
              const likeStatus = await checkLikeStatus(token, review._id);
              if (likeStatus.isLiked) {
                likedSet.add(review._id);
              }
            } catch (error) {
              console.error('Error checking like status:', error);
            }
          }
          setLikedReviews(likedSet);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Không hiển thị alert cho lỗi load reviews vì có thể do chưa đăng nhập
    } finally {
      setReviewsLoading(false);
    }
  };

  // Handle like/unlike review
  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để like đánh giá');
      return;
    }

    try {
      const isCurrentlyLiked = likedReviews.has(reviewId);
      
      const token = useAuthStore.getState().token;
      if (!token) return;
      
      if (isCurrentlyLiked) {
        // Unlike
        await unlikeReview(token, reviewId);
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          return newSet;
        });
        
        // Update review helpfulCount
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: Math.max(0, review.helpfulCount - 1) }
            : review
        ));
      } else {
        // Like
        await likeReview(token, reviewId);
        setLikedReviews(prev => new Set([...prev, reviewId]));
        
        // Update review helpfulCount
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        ));
      }
    } catch (error: any) {
      console.error('Error handling like:', error);
      Alert.alert('Thông báo', error.message || 'Không thể thực hiện thao tác');
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  // Setup polling để kiểm tra phản hồi admin mới
  useEffect(() => {
    if (!isAuthenticated || !id) return;

    // Polling interval để kiểm tra phản hồi admin mới
    const pollInterval = setInterval(async () => {
      try {
        const response = await getReviewsByProduct(id as string, 1, 10);
                     const newReviews = response.reviews || [];
        
                     // So sánh với reviews hiện tại để tìm phản hồi admin mới
             setReviews(prevReviews => {
               const updatedReviews = prevReviews.map(prevReview => {
                 const newReview = newReviews.find((r: any) => r._id === prevReview._id);
                 if (newReview && (newReview as any).adminReplies && (newReview as any).adminReplies.length > ((prevReview as any).adminReplies?.length || 0)) {
                               // Có phản hồi admin mới
                 const newReplies = (newReview as any).adminReplies.slice(((prevReview as any).adminReplies?.length || 0));
              
              // Hiển thị thông báo cho user
              Alert.alert(
                'Phản hồi mới',
                `Admin đã phản hồi đánh giá của bạn về sản phẩm "${(currentProduct as any)?.nameProduct || 'Sản phẩm'}"`,
                [
                  {
                    text: 'Xem ngay',
                    onPress: () => {
                      // Scroll đến review có phản hồi
                      setShowAllReviews(true);
                      setTimeout(() => {
                        const reviewElement = reviewRefs.current[newReview._id];
                        if (reviewElement) {
                          reviewElement.measureLayout(
                            scrollViewRef.current?.getInnerViewNode(),
                            (x: number, y: number) => {
                              scrollViewRef.current?.scrollTo({ y, animated: true });
                            },
                            () => console.log('Failed to measure review position')
                          );
                        }
                      }, 500);
                    }
                  },
                  { text: 'Đóng', style: 'cancel' }
                ]
              );
              
              return newReview;
            }
            return prevReview;
          });
          
          return updatedReviews;
        });
      } catch (error) {
        console.error('Error polling for admin replies:', error);
      }
    }, 10000); // Kiểm tra mỗi 10 giây

    // Cleanup interval
    return () => {
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, id, (currentProduct as any)?.nameProduct]);

  // Reset quantity về 1 khi sản phẩm thay đổi
  useEffect(() => {
    setQuantity(1);
    setSelectedImageIndex(0);
    setShowCartModal(false);
    setShowAllReviews(false);
  }, [id]);

  // Reset scroll state khi product thay đổi
  useEffect(() => {
    setHasScrolledToReview(false);
    console.log('🔍 Product changed, reset scroll state');
  }, [id]);

  // Thêm useEffect để scroll đến review khi có params
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', { scrollToReview, targetReviewId, reviewsLength: reviews.length, hasScrolledToReview });
    
    if (scrollToReview === 'true' && targetReviewId && reviews.length > 0 && !hasScrolledToReview) {
      console.log('🔍 Tìm review để scroll:', targetReviewId);
      console.log('📋 Danh sách reviews:', reviews.map(r => ({ id: r._id, name: r.idUser?.name })));
      
      // Đánh dấu đã scroll để tránh scroll lại
      setHasScrolledToReview(true);
      
      // Đợi một chút để reviews được load và render
      const timer = setTimeout(() => {
        const targetReview = reviews.find(review => review._id === targetReviewId);
        console.log('🎯 Target review found:', targetReview ? 'YES' : 'NO');
        
        if (targetReview) {
          // Tìm index của review trong danh sách hiển thị
          const displayReviews = showAllReviews ? reviews : reviews.slice(0, 3);
          const reviewIndex = displayReviews.findIndex(review => review._id === targetReviewId);
          console.log('📍 Review index:', reviewIndex);
          
          if (reviewIndex !== -1) {
            // Approach 1: Scroll đến phần reviews trước
            console.log('📏 Scroll đến phần reviews...');
            scrollViewRef.current?.scrollTo({
              y: 1000, // Scroll đến phần reviews
              animated: true
            });
            
            // Approach 2: Sau đó scroll đến review cụ thể
            setTimeout(() => {
              const estimatedReviewHeight = 250; // Chiều cao ước tính của mỗi review
              const estimatedOffset = reviewIndex * estimatedReviewHeight;
              
              console.log('📏 Scroll đến review cụ thể:', estimatedOffset);
              scrollViewRef.current?.scrollTo({
                y: 1000 + estimatedOffset,
                animated: true
              });
            }, 500);
          } else {
            // Nếu review không trong danh sách hiển thị, mở tất cả reviews
            console.log('🔄 Mở tất cả reviews để tìm review target');
            setShowAllReviews(true);
            
            // Đợi thêm một chút để UI update
            setTimeout(() => {
              const newDisplayReviews = reviews;
              const newReviewIndex = newDisplayReviews.findIndex(review => review._id === targetReviewId);
              if (newReviewIndex !== -1) {
                const estimatedReviewHeight = 250; // Chiều cao ước tính của mỗi review
                const estimatedOffset = newReviewIndex * estimatedReviewHeight;
                console.log('📏 Scroll to position (all reviews):', estimatedOffset);
                
                // Scroll đến phần reviews trước
                scrollViewRef.current?.scrollTo({
                  y: 1000,
                  animated: true
                });
                
                // Sau đó scroll đến review cụ thể
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: 1000 + estimatedOffset,
                    animated: true
                  });
                }, 500);
              }
            }, 1000);
          }
        } else {
          console.log('❌ Không tìm thấy review với ID:', targetReviewId);
          // Fallback: scroll đến phần reviews
          console.log('🔄 Fallback: scroll đến phần reviews');
          scrollViewRef.current?.scrollTo({
            y: 1000,
            animated: true
          });
        }
      }, 2000); // Tăng thời gian chờ

      return () => clearTimeout(timer);
    } else {
      console.log('🔍 useEffect conditions not met:', { 
        scrollToReview, 
        hasTargetReviewId: !!targetReviewId, 
        reviewsLength: reviews.length,
        hasScrolledToReview
      });
    }
  }, [scrollToReview, targetReviewId, reviews, showAllReviews, hasScrolledToReview]);

  // Thêm useEffect riêng để kiểm tra params khi component mount
  useEffect(() => {
    console.log('🔍 Component mount check - Params:', { scrollToReview, targetReviewId });
    
    // Nếu có params scrollToReview nhưng chưa có reviews, đợi reviews load
    if (scrollToReview === 'true' && targetReviewId && reviews.length === 0) {
      console.log('🔍 Waiting for reviews to load...');
    }
  }, []); // Chỉ chạy một lần khi component mount

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

  // Format ngày đánh giá an toàn
  const formatReviewDate = (r: any): string => {
    const raw = r?.createdAt || r?.created_at || r?.updatedAt || r?.updated_at;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) ? d.toLocaleDateString('vi-VN') : '';
  };

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
        Alert.alert('Thông báo', 'Token không hợp lệ');
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
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Thông báo', 'Không thể thực hiện thao tác');
    }
  };

  const handleAddToCart = async () => {
    if (!currentProduct) return;

    // Kiểm tra số lượng tồn kho
    const productStock = currentProduct.quantity || 0;
    if (productStock <= 0) {
      Alert.alert('Thông báo', 'Sản phẩm này đã hết hàng');
      return;
    }

    // Kiểm tra trạng thái sản phẩm
    if (currentProduct.status === 'inactive') {
      Alert.alert('Thông báo', 'Sản phẩm này hiện đang tạm ngưng bán');
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      const result = await addToCart(token, currentProduct._id, quantity);
      
      // Xử lý kết quả từ API
      if (result.success) {
        // Reset số lượng về 1 sau khi thêm vào giỏ hàng thành công
        setQuantity(1);
        
        // Kiểm tra nếu là số lượng lớn
        if (result.isLargeQuantity) {
          Alert.alert(
            'Xác nhận mua hàng',
            'Bạn đang mua quá nhiều sản phẩm. Bạn có chắc chắn muốn mua không?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Mua', onPress: () => {
                Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
                setShowCartModal(false);
              }}
            ]
          );
        } else {
          Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
          setShowCartModal(false);
        }
      } else if (result.shouldAdjust) {
        // Hiển thị thông báo tồn kho và tự động điều chỉnh
        Alert.alert(
          'Thông báo tồn kho',
          result.message,
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  // Tự động điều chỉnh về số lượng tối đa
                  setQuantity(result.availableQuantity || 0);
                  await addToCart(token, currentProduct._id, result.availableQuantity || 0);
                  // Reset số lượng về 1 sau khi thêm vào giỏ hàng
                  setQuantity(1);
                  // Không hiển thị thông báo khi đã đạt tối đa
                  setShowCartModal(false);
                } catch (error: any) {
                  Alert.alert('Thông báo', 'Không thể thêm vào giỏ hàng');
                }
              }
            }
          ]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể thêm vào giỏ hàng';
      Alert.alert('Thông báo', errorMessage);
    }
  };

  const handleIncreaseQuantity = () => {
    if (!currentProduct) return;

    const newQuantity = quantity + 1;
    
    // Kiểm tra số lượng tồn kho
    const productStock = currentProduct.quantity || 0;
    if (newQuantity > productStock) {
      Alert.alert('Thông báo', `Chỉ còn ${productStock} sản phẩm trong kho`);
      return;
    }

    // Hiển thị thông báo xác nhận khi đạt 15 sản phẩm (chỉ 1 lần)
    if (newQuantity === 15 && !confirmedLargeQuantity) {
      Alert.alert(
        'Xác nhận mua hàng',
        'Bạn đang mua quá nhiều sản phẩm cho một sản phẩm. Bạn có chắc chắn muốn mua không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mua', onPress: () => {
            setConfirmedLargeQuantity(true);
            setQuantity(newQuantity);
          }}
        ]
      );
      return;
    }

    setQuantity(newQuantity);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (text: string) => {
    const num = parseInt(text);
    if (!isNaN(num) && num > 0) {
      if (!currentProduct) return;

      // Kiểm tra số lượng tồn kho
      const productStock = currentProduct.quantity || 0;
      if (num > productStock) {
        // Tự động điều chỉnh về số lượng tồn kho
        setQuantity(productStock);
        Alert.alert('Thông báo', `Chỉ còn ${productStock} sản phẩm trong kho. Số lượng đã được điều chỉnh.`);
        return;
      }

      // Hiển thị thông báo xác nhận khi đạt 15 sản phẩm (chỉ 1 lần)
      if (num === 15 && !confirmedLargeQuantity) {
        Alert.alert(
          'Xác nhận mua hàng',
          'Bạn đang mua quá nhiều sản phẩm cho một sản phẩm. Bạn có chắc chắn muốn mua không?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mua', onPress: () => {
              setConfirmedLargeQuantity(true);
              setQuantity(num);
            }}
          ]
        );
        return;
      }

      setQuantity(num);
    } else if (text === '') {
      // Cho phép xóa để nhập lại
      setQuantity(1);
    }
  };

  const handleQuantityBlur = () => {
    // Đảm bảo số lượng không vượt quá tồn kho khi người dùng nhập xong
    if (!currentProduct) return;

    const productStock = currentProduct.quantity || 0;

    if (quantity > productStock) {
      setQuantity(productStock);
      Alert.alert('Thông báo', `Số lượng đã được điều chỉnh về ${productStock} theo tồn kho.`);
    }
  };

  const handleBuyNow = async () => {
    if (!currentProduct) return;

    // Kiểm tra số lượng tồn kho
    const productStock = currentProduct.quantity || 0;
    if (productStock <= 0) {
      Alert.alert('Thông báo', 'Sản phẩm này đã hết hàng');
      return;
    }

    // Kiểm tra trạng thái sản phẩm
    if (currentProduct.status === 'inactive') {
      Alert.alert('Thông báo', 'Sản phẩm này hiện đang tạm ngưng bán');
      return;
    }

    // Kiểm tra số lượng
    if (quantity > productStock) {
      Alert.alert('Thông báo', `Chỉ còn ${productStock} sản phẩm trong kho`);
      return;
    }

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập để mua hàng');
        return;
      }

      await addToCart(token, currentProduct._id, quantity);
      router.push('/checkout');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể mua sản phẩm này';
      Alert.alert('Thông báo', errorMessage);
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

  const images = getProductImages(currentProduct) || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        ref={scrollViewRef} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
            source={{ uri: images.length > 0 && images[selectedImageIndex] !== 'https://via.placeholder.com/300x300?text=No+Image' 
              ? images[selectedImageIndex] 
              : 'https://via.placeholder.com/400x400?text=Product+Image' }}
            style={styles.mainImage}
            resizeMode="cover"
            defaultSource={require('../../assets/images_sp/dau_ca_omega.png')}
            onError={(error) => {
              // Image load error handled silently
            }}
            onLoad={() => {
              // Image loaded successfully
            }}
          />
          {images && images.length > 1 && (
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
              // Image load error handled silently
            }}
            onLoad={() => {
              // Image loaded successfully
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
                {typeof currentProduct.idBrand === 'object' && currentProduct.idBrand?.name 
                  ? currentProduct.idBrand.name 
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
                {section.items && section.items.map((item, itemIndex) => renderSectionItem(item, itemIndex))}
              </View>
            ))}
          </View>
        )}

        {/* Reviews Section */}
        <View style={[styles.reviewsContainer, { backgroundColor: colors.card }]}>
          {/* Overall Rating Header */}
          <View style={styles.overallRatingContainer}>
            <View style={styles.ratingLeft}>
              <Text style={[styles.overallRating, { color: colors.text }]}>
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </Text>
              <View style={styles.overallStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= averageRating ? 'star' : 'star-outline'}
                    size={16}
                    color={star <= averageRating ? '#FFD700' : colors.textSecondary}
                    style={styles.overallStar}
                  />
                ))}
              </View>
              <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>
                {reviews.length} đánh giá
              </Text>
            </View>
            <View style={styles.ratingRight}>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setShowAllReviews(!showAllReviews)}
              >
                <Text style={[styles.viewAllText, { color: colors.accent }]}>
                  Xem tất cả
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Reviews Content */}
          {reviewsLoading ? (
            <View style={styles.reviewsLoadingContainer}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Đang tải đánh giá...
              </Text>
            </View>
          ) : reviews.length > 0 ? (
            <View style={styles.reviewsContent}>
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
                <View 
                  key={review._id || index} 
                  ref={ref => {
                    if (ref) {
                      reviewRefs.current[review._id] = ref;
                    }
                  }}
                  style={[styles.reviewItem, { borderBottomColor: colors.border }]}
                >
                  {/* Review Header */}
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <Ionicons name="person" size={20} color={colors.textSecondary} />
                      </View>
                      <View style={styles.reviewerDetails}>
                        <Text style={[styles.reviewerName, { color: colors.text }]}>
                          {review.idUser?.name || review.userName || review.name || 'Khách hàng'}
                        </Text>
                        <View style={styles.ratingContainer}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                              key={star}
                              name={star <= review.rating ? 'star' : 'star-outline'}
                              size={14}
                              color={star <= review.rating ? '#FFD700' : colors.textSecondary}
                              style={styles.starIcon}
                            />
                          ))}
                          <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                            {formatReviewDate(review)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                   {/* Review Content - căn trái */}
                   <View style={styles.reviewContent}>
                     {review.productClassification && (
                       <View style={[styles.reviewCategoryContainer, { backgroundColor: colors.background }]}>
                         <Text style={[styles.reviewCategory, { color: colors.textSecondary }]}>
                           Phân loại: <Text style={[styles.reviewCategoryItalic, { color: colors.text }]}>
                             {review.productClassification}
                           </Text>
                         </Text>
                       </View>
                     )}
                     {review.review && review.review.trim() !== '' ? (
                       <Text style={[styles.reviewText, { color: colors.text }]}>
                         {review.review}
                       </Text>
                     ) : (
                       <Text style={[styles.reviewText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                         Không có nội dung đánh giá
                       </Text>
                     )}
                   </View>

                   {/* Admin Reply: hỗ trợ mảng adminReplies và các field cũ */}
                   {(
                     (Array.isArray(review.adminReplies) && review.adminReplies.length > 0) ||
                     review.adminReply || review.reply || review.response || review.adminResponse
                   ) && (
                     <View style={[styles.adminReplyContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                       <Text style={[styles.adminReplyTitle, { color: colors.accent }]}>Phản hồi của Admin</Text>
                       {Array.isArray(review.adminReplies) && review.adminReplies.length > 0 ? (
                         review.adminReplies.map((rep: any, idx: number) => (
                           <View key={idx} style={{ marginTop: idx === 0 ? 0 : 8 }}>
                             <Text style={[styles.adminReplyText, { color: colors.text }]}>
                               {rep.content}
                             </Text>
                             {rep.createdAt && (
                               <Text style={[styles.adminReplyDate, { color: colors.textSecondary }]}>
                                 {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                               </Text>
                             )}
                           </View>
                         ))
                       ) : (
                         <>
                           <Text style={[styles.adminReplyText, { color: colors.text }]}>
                             {review.adminReply || review.reply || review.response || review.adminResponse}
                           </Text>
                           {formatReviewDate(review.adminReplyAt ? { createdAt: review.adminReplyAt } : review) ? (
                             <Text style={[styles.adminReplyDate, { color: colors.textSecondary }]}>
                               {formatReviewDate(review.adminReplyAt ? { createdAt: review.adminReplyAt } : review)}
                             </Text>
                           ) : null}
                         </>
                       )}
                     </View>
                   )}
                  
                  {/* Review Actions */}
                  <View style={styles.reviewActions}>
                    <TouchableOpacity 
                      style={[
                        styles.helpfulButton,
                        likedReviews.has(review._id) && { backgroundColor: 'rgba(70, 155, 67, 0.1)' }
                      ]}
                      onPress={() => handleLikeReview(review._id)}
                    >
                      <Ionicons 
                        name={likedReviews.has(review._id) ? "thumbs-up" : "thumbs-up-outline"} 
                        size={16} 
                        color={likedReviews.has(review._id) ? colors.accent : colors.textSecondary} 
                      />
                      <Text style={[
                        styles.helpfulText, 
                        { color: likedReviews.has(review._id) ? colors.accent : colors.textSecondary }
                      ]}>
                        Hữu ích ({review.helpfulCount || 0})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {/* Show More Button */}
              {reviews.length > 3 && !showAllReviews && (
                <TouchableOpacity 
                  style={[styles.showMoreReviewsButton, { borderColor: colors.border }]}
                  onPress={() => setShowAllReviews(true)}
                >
                  <Text style={[styles.showMoreReviewsText, { color: colors.accent }]}>
                    Xem thêm {reviews.length - 3} đánh giá khác
                  </Text>
                  <Ionicons name="chevron-down" size={16} color={colors.accent} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.noReviewsText, { color: colors.textSecondary }]}>
                Chưa có đánh giá nào
              </Text>
              <Text style={[styles.noReviewsSubtext, { color: colors.textSecondary }]}>
                Hãy là người đầu tiên đánh giá sản phẩm này
              </Text>
            </View>
          )}
        </View>

        {/* Related Products */}
        <View style={[styles.relatedContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.relatedTitle, { color: colors.text }]}>
            Sản phẩm liên quan
          </Text>
          {relatedProducts.length > 0 ? (
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          ) : (
            <Text style={[{ color: colors.textSecondary, textAlign: 'center', padding: 20 }]}>
              Đang tải sản phẩm liên quan...
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {currentProduct && (currentProduct.quantity || 0) > 0 && currentProduct.status === 'active' ? (
          <>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={handleDecreaseQuantity} style={styles.quantityButton}>
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                style={[styles.quantityInput, { color: colors.text }]}
                value={quantity.toString()}
                onChangeText={handleQuantityChange}
                onBlur={handleQuantityBlur}
                keyboardType="numeric"
                maxLength={2}
                textAlign="center"
              />
              <TouchableOpacity 
                onPress={handleIncreaseQuantity} 
                style={[
                  styles.quantityButton,
                  (quantity >= maxQuantity) && styles.quantityButtonDisabled
                ]}
                disabled={quantity >= maxQuantity}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={quantity >= maxQuantity ? colors.textSecondary : colors.text} 
                />
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
          </>
        ) : currentProduct && currentProduct.status === 'inactive' ? (
          <View style={[styles.suspendedContainer, { backgroundColor: '#f5f5f5' }]}>
            <Ionicons name="pause-circle" size={24} color="#ff9800" />
            <Text style={[styles.suspendedText, { color: '#ff9800' }]}>
              Tạm ngưng
            </Text>
          </View>
        ) : (
          <View style={[styles.outOfStockContainer, { backgroundColor: '#f5f5f5' }]}>
            <Ionicons name="alert-circle" size={24} color="#c62828" />
            <Text style={[styles.outOfStockText, { color: '#c62828' }]}>
              Hết hàng
            </Text>
          </View>
        )}
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
    paddingBottom: 90, // Tránh bị che bởi bottom tabs
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
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
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    width: 40,
    textAlign: 'center',
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
  overallRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingLeft: {
    alignItems: 'flex-start',
    minWidth: 100,
  },
  overallRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  overallStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallStar: {
    marginRight: 2,
  },
  ratingCount: {
    fontSize: 12,
    marginTop: 4,
  },
  ratingRight: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  reviewsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  reviewItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    width: '100%',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    width: '100%',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  reviewContent: {
    marginTop: 12,
    width: '100%',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  reviewActions: {
    marginTop: 12,
  },
  adminReplyContainer: {
    width: '100%',
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  adminReplyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
  },
  adminReplyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  adminReplyDate: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'left',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignSelf: 'flex-start',
  },
  helpfulText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  reviewCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  reviewCategoryContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    width: '100%',
  },
  reviewCategoryItalic: {
    fontStyle: 'italic',
  },
  showMoreReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(70, 155, 67, 0.05)',
    width: '100%',
  },
  showMoreReviewsText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noReviewsSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
  reviewsContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    width: '100%',
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  outOfStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  outOfStockText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  suspendedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 0,
    marginTop: 10,
    width: '100%',
  },
  suspendedText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProductScreen;
