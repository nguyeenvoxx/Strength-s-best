import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';

interface UpdateStatusBarProps {
  lastUpdated: Date | null;
  loading?: boolean;
  error?: string | null;
}

const UpdateStatusBar: React.FC<UpdateStatusBarProps> = ({
  lastUpdated,
  loading = false,
  error = null
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
      <View style={[styles.container, { backgroundColor: colors.accent + '20' }]}>
        <Ionicons name="sync" size={16} color={colors.accent} />
        <Text style={[styles.text, { color: colors.accent }]}>
          Đang cập nhật...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.error + '20' }]}>
        <Ionicons name="warning" size={16} color={colors.error} />
        <Text style={[styles.text, { color: colors.error }]}>
          Lỗi cập nhật: {error}
        </Text>
      </View>
    );
  }

  if (lastUpdated) {
    const timeAgo = getTimeAgo(lastUpdated);
    return (
      <View style={[styles.container, { backgroundColor: colors.accent + '10' }]}>
        <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
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
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  text: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default UpdateStatusBar;





