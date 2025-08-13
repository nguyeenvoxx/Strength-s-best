import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#5CB85C',
    border: '#404040'
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#469B43',
    border: '#e0e0e0'
  };

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Thêm nút "Trước"
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key="prev"
          style={[styles.pageButton, { borderColor: colors.border }]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={isLoading}
        >
          <Ionicons name="chevron-back" size={16} color={colors.text} />
        </TouchableOpacity>
      );
    }

    // Thêm nút trang đầu nếu cần
    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key={1}
          style={[styles.pageButton, { borderColor: colors.border }]}
          onPress={() => handlePageChange(1)}
          disabled={isLoading}
        >
          <Text style={[styles.pageText, { color: colors.text }]}>1</Text>
        </TouchableOpacity>
      );
      
      if (startPage > 2) {
        pages.push(
          <View key="dots1" style={styles.dotsContainer}>
            <Text style={[styles.dotsText, { color: colors.textSecondary }]}>...</Text>
          </View>
        );
      }
    }

    // Thêm các trang hiển thị
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            { borderColor: colors.border },
            i === currentPage && { backgroundColor: colors.accent, borderColor: colors.accent }
          ]}
          onPress={() => handlePageChange(i)}
          disabled={isLoading}
        >
          <Text style={[
            styles.pageText,
            { color: i === currentPage ? '#fff' : colors.text }
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // Thêm nút trang cuối nếu cần
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <View key="dots2" style={styles.dotsContainer}>
            <Text style={[styles.dotsText, { color: colors.textSecondary }]}>...</Text>
          </View>
        );
      }
      
      pages.push(
        <TouchableOpacity
          key={totalPages}
          style={[styles.pageButton, { borderColor: colors.border }]}
          onPress={() => handlePageChange(totalPages)}
          disabled={isLoading}
        >
          <Text style={[styles.pageText, { color: colors.text }]}>{totalPages}</Text>
        </TouchableOpacity>
      );
    }

    // Thêm nút "Sau"
    if (endPage < totalPages) {
      pages.push(
        <TouchableOpacity
          key="next"
          style={[styles.pageButton, { borderColor: colors.border }]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={isLoading}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.text} />
        </TouchableOpacity>
      );
    }

    return pages;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.paginationContainer}>
        {renderPageNumbers()}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Trang {currentPage} / {totalPages}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Pagination;

