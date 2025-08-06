import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { getProductImages, formatPrice } from '../utils/productUtils';

const FavoriteScreen: React.FC = () => {
  const { favorites, fetchFavorites, removeFromFavorites, isLoading, error, clearError } = useFavoriteStore();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const router = useRouter();
  const { token, isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchFavorites(token);
    }
  }, [token, isAuthenticated]);

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: './product/[id]',
      params: { id: productId },
    });
  };

  const handleRemoveFavorite = async (favoriteId: string, productName: string) => {
    if (!token) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn xóa "${productName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsRemoving(favoriteId);
              await removeFromFavorites(favoriteId, token);
              Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa khỏi danh sách yêu thích');
            } finally {
              setIsRemoving(null);
            }
          }
        }
      ]
    );
  };

  const handleRetry = () => {
    if (token && isAuthenticated) {
      clearError();
      fetchFavorites(token);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Yêu thích</Text>
      </View>

      {!isAuthenticated ? (
        <View style={styles.loginPromptContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.accent} />
          <Text style={[styles.loginPromptTitle, { color: colors.text }]}>Đăng nhập để xem sản phẩm yêu thích</Text>
          <Text style={[styles.loginPromptText, { color: colors.textSecondary }]}>Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích của bạn</Text>
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.accent }]} 
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={[styles.loginButtonText, { color: '#fff' }]}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải danh sách yêu thích...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={colors.accent} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Có lỗi xảy ra</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]} 
            onPress={handleRetry}
          >
            <Text style={[styles.retryButtonText, { color: '#fff' }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyFavorite}>
          <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có sản phẩm yêu thích</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Thêm sản phẩm vào danh sách yêu thích để xem lại sau</Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('./home')}
          >
            <Text style={[styles.shopButtonText, { color: '#fff' }]}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.favoriteList}>
          {Array.isArray(favorites) && favorites
            .filter((product) => product && typeof product === 'object')
            .map((product) => (
              <View key={product.favoriteId || product._id} style={[styles.productCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  onPress={() => handleProductPress(product._id)}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Image
                    source={{ uri: getProductImages(product)[0] }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text numberOfLines={2} style={[styles.productTitle, { color: colors.text }]}>
                      {product.title}
                    </Text>
                    <Text style={[styles.productPrice, { color: colors.accent }]}>
                      {formatPrice(product.priceProduct)}
                    </Text>
                    {product.idBrand && (
                      <Text style={[styles.productBrand, { color: colors.textSecondary }]}>
                        {typeof product.idBrand === 'object' ? product.idBrand.nameBrand : product.idBrand}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {token && (
                  <TouchableOpacity
                    style={[
                      styles.removeIcon,
                      isRemoving === product.favoriteId && styles.removingIcon
                    ]}
                    onPress={() => handleRemoveFavorite(product.favoriteId!, product.title)}
                    disabled={isRemoving === product.favoriteId}
                  >
                    {isRemoving === product.favoriteId ? (
                      <ActivityIndicator size="small" color="#cc0000" />
                    ) : (
                      <Ionicons name="heart-dislike" size={20} color="#cc0000" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },

  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty state styles
  emptyFavorite: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 20, 
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 30,
  },
  shopButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // List styles
  favoriteList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    marginRight: 12, 
    backgroundColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 5,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 3,
  },
  productBrand: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  removeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  removingIcon: {
    opacity: 0.5,
  },

  // Login prompt styles
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoriteScreen; 