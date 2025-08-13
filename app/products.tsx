import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useCartStore } from '../store/useCartStore';
import { Product } from '../types/product.type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProductImages } from '../utils/productUtils';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import Pagination from '../components/Pagination';

// Thêm interface cho Brand
interface Brand {
  _id: string;
  name: string;
  status?: string;
}

const ProductListScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, isLoading, error, fetchProducts, currentPage, totalPages, totalProducts, setPage } = useProductStore();
  const { isAuthenticated, token } = useAuthStore();
  const { categories, isLoading: categoriesLoading, fetchCategories } = useCategoryStore();
  const cartStore = useCartStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showBrands, setShowBrands] = useState(false);

  // Predefined icons for categories
  const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'Vitamin & Khoáng chất': 'nutrition',
    'Bột Protein': 'fitness',
    'Thực phẩm bổ sung năng lượng': 'flash',
    'Thực phẩm chức năng': 'medical',
    'Dinh dưỡng thể thao': 'barbell',
  };

  // Single green color for all categories
  const categoryColor = colors.accent;

  // Load products, categories and brands when component mounts - không cần đăng nhập
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProducts({ page: 1, limit: 10 }); // Load 10 sản phẩm mỗi trang
        await fetchCategories(); // Load categories
        
        // Fetch brands from API - sử dụng fallback nếu API không có dữ liệu
        try {
          const response = await fetch('http://192.168.1.49:3000/api/v1/brands');
          const data = await response.json();
          if (data.status === 'thành công' && data.data.brands) {
            setBrands(data.data.brands);
          } else {
            // Fallback brands nếu API không có dữ liệu
            setBrands([
              { _id: 'brand-1', name: 'Blackmores', status: 'active' },
              { _id: 'brand-2', name: 'Swisse', status: 'active' },
              { _id: 'brand-3', name: 'Nature Made', status: 'active' },
              { _id: 'brand-4', name: 'Centrum', status: 'active' },
              { _id: 'brand-5', name: 'GNC', status: 'active' },
              { _id: 'brand-6', name: 'Optimum Nutrition', status: 'active' },
              { _id: 'brand-7', name: 'MyProtein', status: 'active' },
              { _id: 'brand-8', name: 'Dymatize', status: 'active' },
              { _id: 'brand-9', name: 'BSN', status: 'active' },
              { _id: 'brand-10', name: 'MuscleTech', status: 'active' },
              { _id: 'brand-11', name: 'Universal Nutrition', status: 'active' },
              { _id: 'brand-12', name: 'Cellucor', status: 'active' },
              { _id: 'brand-13', name: 'Quest Nutrition', status: 'active' },
              { _id: 'brand-14', name: 'Garden of Life', status: 'active' },
              { _id: 'brand-15', name: 'NOW Foods', status: 'active' },
              { _id: 'brand-16', name: 'Jarrow Formulas', status: 'active' },
              { _id: 'brand-17', name: 'Solgar', status: 'active' },
              { _id: 'brand-18', name: 'Nature\'s Bounty', status: 'active' },
              { _id: 'brand-19', name: 'Puritan\'s Pride', status: 'active' },
              { _id: 'brand-20', name: 'Kirkland Signature', status: 'active' },
              { _id: 'brand-21', name: 'Doctor\'s Best', status: 'active' }
            ]);
          }
        } catch (brandError) {
          console.error('Error fetching brands:', brandError);
          // Fallback brands khi có lỗi
          setBrands([
            { _id: 'brand-1', name: 'Blackmores', status: 'active' },
            { _id: 'brand-2', name: 'Swisse', status: 'active' },
            { _id: 'brand-3', name: 'Nature Made', status: 'active' },
            { _id: 'brand-4', name: 'Centrum', status: 'active' },
            { _id: 'brand-5', name: 'GNC', status: 'active' },
            { _id: 'brand-6', name: 'Optimum Nutrition', status: 'active' },
            { _id: 'brand-7', name: 'MyProtein', status: 'active' },
            { _id: 'brand-8', name: 'Dymatize', status: 'active' },
            { _id: 'brand-9', name: 'BSN', status: 'active' },
            { _id: 'brand-10', name: 'MuscleTech', status: 'active' },
            { _id: 'brand-11', name: 'Universal Nutrition', status: 'active' },
            { _id: 'brand-12', name: 'Cellucor', status: 'active' },
            { _id: 'brand-13', name: 'Quest Nutrition', status: 'active' },
            { _id: 'brand-14', name: 'Garden of Life', status: 'active' },
            { _id: 'brand-15', name: 'NOW Foods', status: 'active' },
            { _id: 'brand-16', name: 'Jarrow Formulas', status: 'active' },
            { _id: 'brand-17', name: 'Solgar', status: 'active' },
            { _id: 'brand-18', name: 'Nature\'s Bounty', status: 'active' },
            { _id: 'brand-19', name: 'Puritan\'s Pride', status: 'active' },
            { _id: 'brand-20', name: 'Kirkland Signature', status: 'active' },
            { _id: 'brand-21', name: 'Doctor\'s Best', status: 'active' }
          ]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    // Luôn load data, không cần kiểm tra đăng nhập
    loadData();
  }, [fetchProducts, fetchCategories]);

  // Handle category filter from URL params
  useEffect(() => {
    if (params.category && typeof params.category === 'string') {
      setActiveTab(params.category);
    }
  }, [params.category]);

  // Load products when page changes
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchProducts({ 
          page: currentPage, 
          limit: 10,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          brand: selectedBrand !== 'all' ? selectedBrand : undefined
        });
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    
    loadProducts();
  }, [currentPage, selectedCategory, selectedBrand, fetchProducts]);

  // Add to cart function
  const addToCart = async (product: Product) => {
    if (!isAuthenticated) {
      Alert.alert('Đăng nhập cần thiết', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/(auth)/sign-in') }
      ]);
      return;
    }

    try {


      await cartStore.addToCart(token!, product._id, 1);
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  // Use products directly from store (already filtered by backend)
  const displayProducts = useMemo(() => {
    return products || [];
  }, [products]);

  // Get brands for selected category
  const getBrandsForCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      return brands;
    }
    
    const categoryProducts = products.filter(product => {
      if (!product.idCategory) return false;
      
      if (typeof product.idCategory === 'object' && product.idCategory?._id) {
        return product.idCategory._id === categoryId;
      }
      return product.idCategory === categoryId;
    });

    const brandIds = new Set<string>();
    categoryProducts.forEach(product => {
      if (product.idBrand) {
        if (typeof product.idBrand === 'object' && product.idBrand?._id) {
          brandIds.add(product.idBrand._id);
        } else if (typeof product.idBrand === 'string') {
          brandIds.add(product.idBrand);
        }
      }
    });

    return brands.filter(brand => brandIds.has(brand._id));
  };

  // Get available brands for current category
  const availableBrands = useMemo(() => {
    if (selectedCategory === 'all') {
      return brands;
    }
    // Only show brands that belong to the selected category
    return getBrandsForCategory(selectedCategory);
  }, [selectedCategory, brands, products]);

  // Get categories for selected brand
  const getCategoriesForBrand = (brandId: string) => {
    if (brandId === 'all') {
      return categories;
    }
    
    const brandProducts = products.filter(product => {
      if (!product.idBrand) return false;
      
      if (typeof product.idBrand === 'object' && product.idBrand?._id) {
        return product.idBrand._id === brandId;
      }
      return product.idBrand === brandId;
    });

    const categoryIds = new Set<string>();
    brandProducts.forEach(product => {
      if (product.idCategory) {
        if (typeof product.idCategory === 'object' && product.idCategory?._id) {
          categoryIds.add(product.idCategory._id);
        } else if (typeof product.idCategory === 'string') {
          categoryIds.add(product.idCategory);
        }
      }
    });

    return categories.filter(category => categoryIds.has(category._id));
  };



  const handleProductPress = (productId: string) => {
    router.replace(`./product/${productId}`);
  };

  // Bỏ kiểm tra đăng nhập để xem sản phẩm - cho phép xem mà không cần đăng nhập

  if (isLoading || categoriesLoading) {
    return (
      <View style={[styles.container, getPlatformContainerStyle()]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sản phẩm</Text>
          <TouchableOpacity onPress={() => router.push('./search')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
                 <View style={styles.loadingContainer}>
                           <ActivityIndicator size="large" color={colors.accent} />
           <Text style={styles.loadingText}>Đang tải...</Text>
         </View>
      </View>
    );
  }

  const renderProduct = ({ item }: { item: any }) => {
    const productImages = getProductImages(item);
    const imageSource = productImages.length > 0 && productImages[0] !== 'https://via.placeholder.com/300x300?text=No+Image' 
      ? productImages[0] 
      : 'https://via.placeholder.com/150x150?text=No+Image';
    
    // Tính toán giá
    const numericPrice = typeof item.priceProduct === 'number' 
      ? item.priceProduct 
      : typeof item.priceProduct === 'string'
        ? parseFloat(String(item.priceProduct).replace(/[^0-9.-]+/g, ''))
        : 0;
    
    // Tính giá dựa trên discount từ backend
    const discountPercent = item.discount || 0;
    const salePrice = numericPrice * (1 - discountPercent / 100);
    
    // Chỉ hiển thị giá khuyến mãi nếu có discount
    const displayPrice = numericPrice > 0 
      ? (discountPercent > 0 ? salePrice : numericPrice).toLocaleString('vi-VN') + ' ₫'
      : 'Liên hệ';
      
    const displayOriginalPrice = (numericPrice > 0 && discountPercent > 0) 
      ? numericPrice.toLocaleString('vi-VN') + ' ₫'
      : '';

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => handleProductPress(item._id)}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: imageSource }}
            style={styles.productImage}
            resizeMode="cover"
            defaultSource={require('../assets/images_sp/dau_ca_omega.png')}
            onError={(error) => {
                      // Image load error handled silently
      }}
      onLoad={() => {
        // Image loaded successfully
      }}
          />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>{displayPrice}</Text>
            <Text style={styles.originalPrice}>{displayOriginalPrice}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(item)}>
            <Ionicons name="add" size={16} color="#fff" style={styles.addIcon} />
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      {/* Header */}
              <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/home')}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sản phẩm</Text>
          <TouchableOpacity onPress={() => router.replace('./search')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Category Selection */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
            contentContainerStyle={styles.categoryContainer}
          >
            {/* All Categories Tab */}
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && { backgroundColor: categoryColor }
              ]}
              onPress={() => {
                setSelectedCategory('all');
                setSelectedBrand('all');
              }}
            >
              <Ionicons 
                name="grid" 
                size={16} 
                color={selectedCategory === 'all' ? '#fff' : categoryColor} 
                style={styles.tabIcon}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === 'all' && { color: '#fff' }
              ]}>
                Tất cả
              </Text>
            </TouchableOpacity>

            {/* Category Tabs */}
            {categories.map(category => {
              const icon = categoryIcons[category.nameCategory] || 'nutrition';
              
              return (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category._id && { backgroundColor: categoryColor }
                  ]}
                  onPress={() => {
                    setSelectedCategory(category._id);
                    setSelectedBrand('all'); // Reset brand khi chọn category mới
                  }}
                >
                  <Ionicons 
                    name={icon} 
                    size={16} 
                    color={selectedCategory === category._id ? '#fff' : categoryColor} 
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category._id && { color: '#fff' }
                  ]}>
                    {category.nameCategory}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Brand Selection - chỉ hiển thị khi đã chọn category */}
        {selectedCategory !== 'all' && availableBrands.length > 0 && (
          <View style={styles.brandSection}>
            <Text style={styles.sectionTitle}>Thương hiệu</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.brandScrollView}
              contentContainerStyle={styles.brandContainer}
            >
              {/* All Brands Tab */}
              <TouchableOpacity
                style={[
                  styles.brandChip,
                  selectedBrand === 'all' && { backgroundColor: categoryColor }
                ]}
                onPress={() => setSelectedBrand('all')}
              >
                <Ionicons 
                  name="business" 
                  size={16} 
                  color={selectedBrand === 'all' ? '#fff' : categoryColor} 
                  style={styles.tabIcon}
                />
                <Text style={[
                  styles.brandText,
                  selectedBrand === 'all' && { color: '#fff' }
                ]}>
                  Tất cả
                </Text>
              </TouchableOpacity>

              {/* Brand Tabs */}
              {availableBrands.map(brand => (
                <TouchableOpacity
                  key={brand._id}
                  style={[
                    styles.brandChip,
                    selectedBrand === brand._id && { backgroundColor: categoryColor }
                  ]}
                  onPress={() => setSelectedBrand(brand._id)}
                >
                  <Ionicons 
                    name="business" 
                    size={16} 
                    color={selectedBrand === brand._id ? '#fff' : categoryColor} 
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.brandText,
                    selectedBrand === brand._id && { color: '#fff' }
                  ]}>
                    {brand.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setPage(page)}
          isLoading={isLoading}
        />

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
  categorySection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  categoryScrollView: {
    paddingHorizontal: 15,
  },
  categoryContainer: {
    paddingRight: 15,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  brandSection: {
    marginBottom: 15,
  },
  brandScrollView: {
    paddingHorizontal: 15,
  },
  brandContainer: {
    paddingRight: 15,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
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
    color: '#4CAF50',
    marginBottom: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
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
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  filterToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProductListScreen;
