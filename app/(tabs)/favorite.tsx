import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';


const FavoriteScreen: React.FC = () => {
  const { favorites, fetchFavorites, removeFromFavorites } = useFavoriteStore();

  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchFavorites(token);
    }
  }, [token]);

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '/product/[id]',
      params: { id: productId },
    });
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyFavorite}>
          <Ionicons name="heart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubtitle}>
            Thêm sản phẩm vào danh sách yêu thích để xem lại sau
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/home')}
          >
            <Text style={styles.shopButtonText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.favoriteList}>
          {Array.isArray(favorites) && favorites
            .filter((product) => product && typeof product === 'object')
            .map((product) => (
              <View key={product.favoriteId || product._id} style={styles.productCard}>
                <TouchableOpacity
                  onPress={() => handleProductPress(product._id)}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
                  <Image
                    source={{ uri: product?.images?.[0] || product?.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text numberOfLines={1} style={styles.productTitle}>{product.title}</Text>
                    <Text style={styles.productPrice}>{product.price}đ</Text>
                  </View>
                </TouchableOpacity>

                {token && (
                  <TouchableOpacity
                    style={styles.removeIcon}
                    onPress={() => {
                      if (token && product.favoriteId) {
                        removeFromFavorites(product.favoriteId, token);
                      } else {
                        console.warn('Thiếu token hoặc favoriteId:', product);
                      }
                    }}
                  >
                    <Ionicons name="heart-dislike" size={20} color="#cc0000" />
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
  removeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emptyFavorite: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#469B43',
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
    padding: 10,
    alignItems: 'center',
    elevation: 2,
  },
  productImage: {
    width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5,
  },
  productPrice: {
    fontSize: 14, color: '#666',
  },
});

export default FavoriteScreen;