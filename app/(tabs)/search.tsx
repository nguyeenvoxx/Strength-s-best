import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types/product.type';
import SearchBar from '../../components/text-input/SearchBar';
import TrendingProductItem from '../../modules/HomeScreen/TrendingProductItem';
import { useRouter } from 'expo-router';
import { useProductStore } from '../../store/useProductStore';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const numColumns = 2;

interface FilterOption {
  id: string;
  label: string;
}

const sortOptions: FilterOption[] = [
  { id: 'name_asc', label: 'Tên A-Z' },
  { id: 'name_desc', label: 'Tên Z-A' },
  { id: 'price_asc', label: 'Giá: Thấp đến cao' },
  { id: 'price_desc', label: 'Giá: Cao đến thấp' },
];

const priceRanges: FilterOption[] = [
  { id: 'all', label: 'Tất cả mức giá' },
  { id: 'under_100', label: 'Dưới 100.000 ₫' },
  { id: '100_300', label: '100.000 ₫ - 300.000 ₫' },
  { id: '300_500', label: '300.000 ₫ - 500.000 ₫' },
  { id: '500_1000', label: '500.000 ₫ - 1.000.000 ₫' },
  { id: 'over_1000', label: 'Trên 1.000.000 ₫' },
];

const SearchScreen: React.FC = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>('name_asc');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { products, isLoading, error, fetchProducts } = useProductStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  // Debounce search text with loading state
  useEffect(() => {
    if (searchText) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchText]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts(50); // Fetch more products for search
  }, [fetchProducts]);

  // Helper function to check if price is in range
  const isPriceInRange = (priceStr: string, range: string): boolean => {
    // Convert price string to number (remove currency symbols and parse)
    const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, '')) || 0;
    
    switch (range) {
      case 'under_100':
        return price < 100000;
      case '100_300':
        return price >= 100000 && price < 300000;
      case '300_500':
        return price >= 300000 && price < 500000;
      case '500_1000':
        return price >= 500000 && price < 1000000;
      case 'over_1000':
        return price >= 1000000;
      default:
        return true;
    }
  };

  // Helper function for search matching
  const isSearchMatch = (product: Product, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const productTitle = product.title.toLowerCase();
    
    // Search in title and sections content
    const sectionsText = product.sections
      ?.map(section => `${section.title} ${section.items.join(' ')}`)
      .join(' ')
      .toLowerCase() || '';
    
    return productTitle.includes(searchLower) || sectionsText.includes(searchLower);
  };

  // Memoized filtered and sorted products for better performance
  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product => {
        // Search filter - now includes description
        if (!isSearchMatch(product, debouncedSearchText)) {
          return false;
        }
        
        // Price range filter
        if (selectedPriceRange !== 'all') {
          if (!isPriceInRange(product.price, selectedPriceRange)) {
            return false;
          }
        }
        
        return true;
      })
      .sort((a, b) => {
        switch (selectedSort) {
          case 'name_asc':
            return a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' });
          case 'name_desc':
            return b.title.localeCompare(a.title, 'vi', { sensitivity: 'base' });
          case 'price_asc': {
            const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceA - priceB;
          }
          case 'price_desc': {
            const priceA = parseFloat(a.price.replace(/[^0-9.-]+/g, '')) || 0;
            const priceB = parseFloat(b.price.replace(/[^0-9.-]+/g, '')) || 0;
            return priceB - priceA;
          }
          default:
            return 0;
        }
      });
  }, [products, debouncedSearchText, selectedPriceRange, selectedSort]);

  const handleSortPress = () => {
    setShowSortOptions(true);
    setShowPriceFilter(false);
  };

  const handlePriceFilterPress = () => {
    setShowPriceFilter(true);
    setShowSortOptions(false);
  };

  const handleSelectSortOption = (optionId: string) => {
    setSelectedSort(optionId);
    setShowSortOptions(false);
  };

  const handleSelectPriceRange = (rangeId: string) => {
    setSelectedPriceRange(rangeId);
    setShowPriceFilter(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedSort('name_asc');
    setSelectedPriceRange('all');
    setSearchText('');
  };

  // Get filter count for UI indication
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedSort !== 'name_asc') count++;
    if (selectedPriceRange !== 'all') count++;
    if (debouncedSearchText) count++;
    return count;
  };

  const onProductPress = (productId: string) => {
    router.push(`../../product/${productId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getOriginalPrice = (price: number) => {
    return formatPrice(price * 1.2);
  };

  const parsePrice = (rawPrice: string | number | undefined): number => {
  if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  if (typeof rawPrice === 'number') return rawPrice;

  return 0;
};
// console.log('🛒 Sản phẩm:', products);

// console.log('🧾 Thông tin chi tiết:', products);
  return (
    <SafeAreaView style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        {/* Search Header */}
        <View style={[styles.searchHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
          <View style={[styles.searchBar, { backgroundColor: colors.section }]}> 
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel="Tìm kiếm sản phẩm"
              accessibilityHint="Nhập tên sản phẩm để tìm kiếm"
              placeholderTextColor={colors.textSecondary}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : searchText ? (
              <TouchableOpacity 
                onPress={() => setSearchText('')}
                accessibilityLabel="Xóa tìm kiếm"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Container */}
        <View style={[styles.filterContainer, { backgroundColor: colors.background }]}> 
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Quay lại</Text>
          </TouchableOpacity>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, showSortOptions && styles.activeFilterButton, { backgroundColor: colors.section, borderColor: colors.border }]}
              onPress={handleSortPress}
              accessibilityLabel="Sắp xếp sản phẩm"
              accessibilityRole="button"
            >
              <Ionicons name="swap-vertical" size={16} color={showSortOptions ? colors.accent : colors.textSecondary} />
              <Text style={[styles.filterButtonText, showSortOptions && styles.activeFilterText, { color: colors.textSecondary }]}>Sắp xếp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, showPriceFilter && styles.activeFilterButton, { backgroundColor: colors.section, borderColor: colors.border }]}
              onPress={handlePriceFilterPress}
              accessibilityLabel="Lọc theo giá"
              accessibilityRole="button"
            >
              <Ionicons name="options" size={16} color={showPriceFilter ? colors.accent : colors.textSecondary} />
              <Text style={[styles.filterButtonText, showPriceFilter && styles.activeFilterText, { color: colors.textSecondary }]}>Bộ lọc</Text>
              {getActiveFilterCount() > 0 && (
                <View style={[styles.filterBadge, { backgroundColor: colors.danger }]}> 
                  <Text style={[styles.filterBadgeText, { color: '#fff' }]}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            {getActiveFilterCount() > 0 && (
              <TouchableOpacity
                style={[styles.clearFilterButton, { backgroundColor: colors.section, borderColor: colors.danger }]}
                onPress={handleClearFilters}
                accessibilityLabel="Xóa tất cả bộ lọc"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={16} color={colors.danger} />
                <Text style={[styles.clearFilterText, { color: colors.danger }]}>Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sort Modal */}
        <Modal transparent visible={showSortOptions} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowSortOptions(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Sắp xếp theo</Text>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelectSortOption(option.id)}
                    >
                      <Text style={[styles.optionText, { color: colors.text }]}>{option.label}</Text>
                      {selectedSort === option.id && (
                        <Ionicons name="checkmark" size={20} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Price Filter Modal */}
        <Modal transparent visible={showPriceFilter} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowPriceFilter(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Khoảng giá</Text>
                  {priceRanges.map((range) => (
                    <TouchableOpacity
                      key={range.id}
                      style={[styles.optionItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelectPriceRange(range.id)}
                    >
                      <Text style={[styles.optionText, { color: colors.text }]}>{range.label}</Text>
                      {selectedPriceRange === range.id && (
                        <Ionicons name="checkmark" size={20} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Products Grid */}      
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải sản phẩm...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Có lỗi xảy ra</Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.accent }]} 
              onPress={() => fetchProducts(50)}
            >
              <Text style={[styles.retryButtonText, { color: '#fff' }]}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}> 
              {debouncedSearchText ? 'Không tìm thấy sản phẩm' : 'Tìm kiếm sản phẩm'}
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}> 
              {debouncedSearchText 
                ? `Không có kết quả cho "${debouncedSearchText}"`
                : 'Nhập từ khóa để tìm kiếm sản phẩm'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => `${item._id}-${index}`}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <View style={[styles.productCard, { backgroundColor: colors.card }]}> 
                <TrendingProductItem
                  image={item.images[0] || item.image || ''}
                  title={item.title}
                  price={formatPrice(parsePrice(item.price))}
                  originalPrice={getOriginalPrice(parseFloat(item.price))}
                  discount="20%"
                  onPress={() => onProductPress(item._id)}
                />
              </View>
            )}
            columnWrapperStyle={filteredProducts.length > 1 ? styles.productRow : undefined}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
  },
  filterButtons: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    position: 'relative',
  },
  activeFilterButton: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F8FF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  activeFilterText: {
    color: '#4A90E2',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  clearFilterText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 4,
    fontWeight: '500',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  productList: {
    paddingBottom: 20,
  },
  productCard: {
    width: (width - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default SearchScreen;
