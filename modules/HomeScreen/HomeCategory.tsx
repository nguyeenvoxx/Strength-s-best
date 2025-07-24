import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';

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
  const { categories: apiCategories, isLoading, error, fetchCategories } = useCategoryStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  // Predefined icons and colors for categories
  const categoryIcons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'Vitamin & Khoáng chất': 'nutrition',
    'Bột Protein': 'fitness',
    'Thực phẩm bổ sung năng lượng': 'flash',
    'Thực phẩm chức năng': 'medical',
    'Dinh dưỡng thể thao': 'barbell',
  };

  const categoryColors: { [key: string]: string } = {
    'Vitamin & Khoáng chất': '#FF6B6B',
    'Bột Protein': '#4ECDC4',
    'Thực phẩm bổ sung năng lượng': '#45B7D1',
    'Thực phẩm chức năng': '#FFA07A',
    'Dinh dưỡng thể thao': '#98D8C8',
  };

  // Fallback categories if API fails
  const fallbackCategories: CategoryItem[] = [
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Mua sắm tại đây</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FF6B35" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải danh mục...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Mua sắm tại đây</Text>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Mua sắm tại đây</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {apiCategories && apiCategories.length > 0 ? (
          apiCategories.map((category) => {
            const icon = categoryIcons[category.nameCategory] || 'nutrition';
            const color = categoryColors[category.nameCategory] || '#FF6B6B';
            
            return (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryItem}
                onPress={() => onCategoryPress?.(category._id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.nameCategory}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          fallbackCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => onCategoryPress?.(category.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>{category.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 12
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
  },
});

export default HomeCategory;