import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface HomeCategoryProps {
  onCategoryPress?: (categoryId: string) => void;
}

const HomeCategory: React.FC<HomeCategoryProps> = ({ onCategoryPress }) => {
  const categories: CategoryItem[] = [
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mua sắm tại đây</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => onCategoryPress?.(category.id)}
          >
            <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon} size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryContainer: {
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    minWidth: 70,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    maxWidth: 60,
  },
});

export default HomeCategory;