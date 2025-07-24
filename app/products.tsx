import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { Product } from '../types/product.type';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CategoryItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const ProductListScreen: React.FC = () => {
  const router = useRouter();
  const { products, isLoading, error, fetchProducts } = useProductStore();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Sản phẩm');
  const [currentPage, setCurrentPage] = useState(1);

  // Categories from HomeCategory
  const categories: CategoryItem[] = [
    {
      id: 'all',
      title: 'Sản phẩm',
      icon: 'grid',
      color: '#007bff',
    },
    {
      id: 'health',
      title: 'Sức khỏe',
      icon: 'heart',
      color: '#FF6B6B',
    },
    {
      id: 'mom',
      title: 'Mẹ',
      icon: 'woman',
      color: '#4ECDC4',
    },
    {
      id: 'baby',
      title: 'Bé',
      icon: 'happy',
      color: '#45B7D1',
    },
    {
      id: 'beauty',
      title: 'Làm đẹp',
      icon: 'flower',
      color: '#FFA07A',
    },
    {
      id: 'healthy-nuts',
      title: 'Hạt healthy',
      icon: 'nutrition',
      color: '#98D8C8',
    },
  ];

  // Load products when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts(50); // Load more products for listing
    }
  }, [isAuthenticated]);

  // Add to cart function
  const addToCart = async (product: Product) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      const cart = existingCart ? JSON.parse(existingCart) : [];
      // Convert price string to number
      const numericPrice = parseFloat(product.price.replace(/[^0-9.-]+/g, '')) || 0;
      console.log('Thêm vào giỏ:', product);
      const existingItem = cart.find((item: any) => item.id === product.id);
      let updatedCart;

      if (existingItem) {
        updatedCart = cart.map((item: any) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...cart, { 
          ...product, 
          name: product.title, // Map title to name for cart compatibility
          price: numericPrice, 
          quantity: 1,
          image: product.images && product.images[0] ? 
            (typeof product.images[0] === 'string' && product.images[0].startsWith('http') ? 
              { uri: product.images[0] } : 
              product.images[0]
            ) : require('../assets/images_sp/dau_ca_omega.png')
        }];
      }

      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      Alert.alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
    }
  };

  // Filter products based on active tab
  const filteredProducts = activeTab === 'Sản phẩm' ? products : 
    products.filter(product => {
      // For now, show all products for each category
      // In a real app, you would filter based on product categories
      return true;
    });

  // Convert Product to display format
  const displayProducts = filteredProducts.map(product => ({
    id: product.id || product._id,
    name: product.title,
    price: product.price,
    image: product.images && product.images[0] ? 
      (typeof product.images[0] === 'string' && product.images[0].startsWith('http') ? 
        { uri: product.images[0] } : 
        product.images[0]
      ) : require('../assets/images_sp/dau_ca_omega.png'),
    originalProduct: product // Keep reference to original product
  }));

  const handleProductPress = (productId: string) => {
    router.push(`./product/${productId}`);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, getPlatformContainerStyle()]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sản phẩm</Text>
          <TouchableOpacity onPress={() => router.push('./search')}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loginPromptContainer}>
          <Ionicons name="lock-closed-outline" size={48} color="#007bff" />
          <Text style={styles.loginPromptTitle}>Đăng nhập để xem sản phẩm</Text>
          <Text style={styles.loginPromptText}>Vui lòng đăng nhập để khám phá các sản phẩm tuyệt vời của chúng tôi</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, getPlatformContainerStyle()]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sản phẩm</Text>
          <TouchableOpacity onPress={() => router.push('./search')}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
        </View>
      </View>
    );
  }

  const renderProduct = ({ item }: { item: any }) => {
    // Đảm bảo price là số
    const numericPrice = typeof item.price === 'string'
      ? parseFloat(item.price.replace(/[^0-9.-]+/g, ''))
      : item.price;
    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={item.image}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>
            {isNaN(numericPrice) || !numericPrice
              ? 'Liên hệ'
              : (numericPrice * 1000).toLocaleString() + ' đ'}
          </Text>
          <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item.originalProduct)}>
            <Ionicons name="add" size={16} color="#fff" style={styles.addIcon} />
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPagination = () => {
    const pages = [1, 2, 3, 4, 5];
    return (
      <View style={styles.pagination}>
        {pages.map(page => (
          <TouchableOpacity
            key={page}
            style={[
              styles.pageButton,
              currentPage === page && styles.activePageButton
            ]}
            onPress={() => setCurrentPage(page)}
          >
            <Text style={[
              styles.pageText,
              currentPage === page && styles.activePageText
            ]}>
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm</Text>
        <TouchableOpacity onPress={() => router.push('./search')}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScrollView}
          contentContainerStyle={styles.tabsContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tabChip,
                activeTab === category.title && { backgroundColor: category.color }
              ]}
              onPress={() => setActiveTab(category.title)}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={activeTab === category.title ? '#fff' : category.color} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText,
                activeTab === category.title && { color: '#fff' }
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Grid */}
        {displayProducts.length > 0 ? (
          <FlatList
            data={displayProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productGrid}
            columnWrapperStyle={styles.productRow}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            <Text style={styles.emptySubText}>Thử chọn danh mục khác</Text>
          </View>
        )}

        {/* Pagination */}
        {renderPagination()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerContact}>support@openl design</Text>
          <Text style={styles.footerTime}>08:00 - 22:00 Everyday</Text>

          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Blog</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerCopyright}>Copyright © OpenL! All Rights Reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  tabsScrollView: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  productGrid: {
    padding: 15,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f9fa',
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 35,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  addIcon: {
    marginRight: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activePageButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  pageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePageText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  footerContact: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  footerTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 30,
  },
  footerLink: {
    paddingVertical: 5,
  },
  footerLinkText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  footerCopyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});

export default ProductListScreen;
