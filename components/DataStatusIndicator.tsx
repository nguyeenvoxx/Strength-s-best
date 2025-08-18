import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';

interface DataStatusIndicatorProps {
  lastUpdated: Date | null;
  loading?: boolean;
  error?: string | null;
  showLastUpdated?: boolean;
}

const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  lastUpdated,
  loading = false,
  error = null,
  showLastUpdated = true
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#5CB85C',
    error: '#ff6b6b',
  } : {
    text: '#333333',
    textSecondary: '#666666',
    accent: '#469B43',
    error: '#ff4757',
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Ionicons name="sync" size={14} color={colors.accent} />
        <Text style={[styles.text, { color: colors.accent }]}>
          Đang cập nhật...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons name="warning" size={14} color={colors.error} />
        <Text style={[styles.text, { color: colors.error }]}>
          Lỗi cập nhật
        </Text>
      </View>
    );
  }

  if (showLastUpdated && lastUpdated) {
    const timeAgo = getTimeAgo(lastUpdated);
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
        <Text style={[styles.text, { color: colors.textSecondary }]}>
          Cập nhật {timeAgo}
        </Text>
      </View>
    );
  }

  return null;
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default DataStatusIndicator;





