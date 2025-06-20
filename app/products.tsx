import React, { useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  price: string;
  category?: string;
  image?: any; // Changed from string to any to support require()
}

const ProductListScreen: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Quà tặng');
  const [currentPage, setCurrentPage] = useState(1);

  const products = [
    { 
      id: '1', 
      name: 'Magic Blackmores', 
      price: '500.000', 
      category: 'Quà tặng',
      image: require('../assets/images_sp/magie_blackmores.png')
    },
    { 
      id: '2', 
      name: 'Dầu cá omega', 
      price: '500.000', 
      category: 'Quà tặng',
      image: require('../assets/images_sp/dau_ca_omega.png')
    },
    { 
      id: '3', 
      name: 'Blackmores Bio C Powder', 
      price: '400.000', 
      category: 'Sản phẩm',
      image: require('../assets/images_sp/magie_blackmores.png')
    },
    { 
      id: '4', 
      name: 'Blackmores Natural', 
      price: '300.000', 
      category: 'Sản phẩm',
      image: require('../assets/images_sp/dau_ca_omega.png')
    },
    { 
      id: '5', 
      name: 'Vitamin D3', 
      price: '250.000', 
      category: 'Sản phẩm',
      image: require('../assets/images_sp/magie_blackmores.png')
    },
    { 
      id: '6', 
      name: 'Calcium Plus', 
      price: '350.000', 
      category: 'Quà tặng',
      image: require('../assets/images_sp/dau_ca_omega.png')
    },
  ];

  const tabs = ['Quà tặng', 'Sản phẩm', 'Khuyến mãi'];

  const filteredProducts = products.filter(product => 
    activeTab === 'Quà tặng' ? product.category === 'Quà tặng' :
    activeTab === 'Sản phẩm' ? product.category === 'Sản phẩm' :
    products // Show all for "Khuyến mãi"
  );

  const handleProductPress = (productId: string) => {
    router.push(`./product/${productId}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
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
        <Text style={styles.productPrice}>{item.price}đ</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sản phẩm</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Product Grid */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={styles.productRow}
        />

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
  tabs: { 
    flexDirection: 'row', 
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeTab: { 
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
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
  addButton: {
    backgroundColor: '#28a745',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default ProductListScreen;
