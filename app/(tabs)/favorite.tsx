import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPlatformContainerStyle } from '../../utils/platformUtils';

const FavoriteScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích</Text>
      </View>
      
      <View style={styles.emptyFavorite}>
        <Ionicons name="heart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
        <Text style={styles.emptySubtitle}>
          Thêm sản phẩm vào danh sách yêu thích để xem lại sau
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('./home')}
        >
          <Text style={styles.shopButtonText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
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
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoriteScreen;
