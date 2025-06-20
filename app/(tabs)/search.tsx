import React, { useState } from 'react';
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
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LIST_PRODUCT_SAMPLE } from '../../constants/app.constant';
import { Product } from '../../types/product.type';
import SearchBar from '../../components/text-input/SearchBar';
import TrendingProductItem from '../../modules/HomeScreen/TrendingProductItem';
import { useRouter } from 'expo-router';

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
  { id: 'under_500', label: 'Dưới 500.000 ₫' },
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

  const products = LIST_PRODUCT_SAMPLE.map((product: Product) => ({
    id: product.id,
    image: product.images[0],
    title: product.title,
    price: product.price,
    originalPrice: `${parseInt(product.price.replace(/[^\d]/g, '')) * 1.2}.000 ₫`,
    discount: '20%',
    rating: product.rating
  }));

  const allProducts = [...products, ...products];
  
  const filteredProducts = allProducts.filter(product => {
    if (searchText && !product.title.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    
    if (selectedPriceRange !== 'all') {
      const price = parseInt(product.price.replace(/[^\d]/g, ''));
      switch (selectedPriceRange) {
        case 'under_500':
          return price < 500000;
        case '500_1000':
          return price >= 500000 && price <= 1000000;
        case 'over_1000':
          return price > 1000000;
        default:
          return true;
      }
    }
    
    return true;
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'name_asc':
        return a.title.localeCompare(b.title);
      case 'name_desc':
        return b.title.localeCompare(a.title);
      case 'price_asc':
        return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
      case 'price_desc':
        return parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''));
      default:
        return 0;
    }
  });

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

  const onProductPress = (productId: string) => {
    router.push(`../../product/${productId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Container */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#333" />
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
          
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, showSortOptions && styles.activeFilterButton]}
              onPress={handleSortPress}
            >
              <Ionicons name="swap-vertical" size={16} color={showSortOptions ? "#4A90E2" : "#666"} />
              <Text style={[styles.filterButtonText, showSortOptions && styles.activeFilterText]}>Sắp xếp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, showPriceFilter && styles.activeFilterButton]}
              onPress={handlePriceFilterPress}
            >
              <Ionicons name="options" size={16} color={showPriceFilter ? "#4A90E2" : "#666"} />
              <Text style={[styles.filterButtonText, showPriceFilter && styles.activeFilterText]}>Bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort Modal */}
        <Modal transparent visible={showSortOptions} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowSortOptions(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Sắp xếp theo</Text>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.optionItem}
                      onPress={() => handleSelectSortOption(option.id)}
                    >
                      <Text style={styles.optionText}>{option.label}</Text>
                      {selectedSort === option.id && (
                        <Ionicons name="checkmark" size={20} color="#4A90E2" />
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
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Khoảng giá</Text>
                  {priceRanges.map((range) => (
                    <TouchableOpacity
                      key={range.id}
                      style={styles.optionItem}
                      onPress={() => handleSelectPriceRange(range.id)}
                    >
                      <Text style={styles.optionText}>{range.label}</Text>
                      {selectedPriceRange === range.id && (
                        <Ionicons name="checkmark" size={20} color="#4A90E2" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Products Grid */}      
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="search-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>
              {searchText ? 'Không tìm thấy sản phẩm' : 'Tìm kiếm sản phẩm'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchText 
                ? `Không có kết quả cho "${searchText}"`
                : 'Nhập từ khóa để tìm kiếm sản phẩm'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <TrendingProductItem
                  image={item.image}
                  title={item.title}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  discount={item.discount}
                  onPress={() => onProductPress(item.id)}
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
  }
});

export default SearchScreen;
