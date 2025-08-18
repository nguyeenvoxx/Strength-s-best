import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFocusEffect } from '@react-navigation/native';

interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promotion' | 'system' | 'news' | 'voucher' | 'product' | 'review';
  isRead: boolean;
  relatedId?: string;
  relatedModel?: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();
    const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError
  } = useNotificationStore();
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications when component mounts
  useEffect(() => {
    if (token) {
      fetchNotifications(token);
    }
  }, [fetchNotifications, token]);

  // Refresh khi màn hình được focus (quay lại từ trang khác)
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchNotifications(token);
      }
    }, [token, fetchNotifications])
  );

  const onRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      await fetchNotifications(token);
    } finally {
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'bag-outline';
      case 'promotion':
        return 'pricetag-outline';
      case 'system':
        return 'settings-outline';
      case 'news':
        return 'newspaper-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return '#4CAF50';
      case 'promotion':
        return '#FF9800';
      case 'system':
        return '#2196F3';
      case 'news':
        return '#9C27B0';
      default:
        return colors.accent;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else {
      return `${days} ngày trước`;
    }
  };



  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: colors.card },
        !item.isRead && { borderLeftWidth: 4, borderLeftColor: getNotificationColor(item.type) }
      ]}
      onPress={() => token && markAsRead(token, item._id)}
    >
      <View style={styles.notificationContent}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) + '20' }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationText}>
          <Text style={[
            styles.notificationTitle,
            { color: colors.text },
            !item.isRead && { fontWeight: '600' }
          ]}>
            {item.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
            {item.message}
          </Text>
          <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
            {formatTime(new Date(item.created_at))}
          </Text>
        </View>
        {!item.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: getNotificationColor(item.type) }]} />
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => token && deleteNotification(token, item._id)}
        >
          <Ionicons name="close" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/profile')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Thông báo {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={() => token && markAllAsRead(token)}
        >
          <Text style={[styles.markAllText, { color: colors.accent }]}>
            Đánh dấu đã đọc
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải thông báo...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.accent} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Có lỗi xảy ra
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={clearError}
          >
            <Text style={[styles.retryButtonText, { color: '#fff' }]}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Không có thông báo
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            Bạn sẽ nhận được thông báo khi có đơn hàng mới hoặc khuyến mãi
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 16,
    paddingBottom: 120,
  },
  notificationItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default NotificationsScreen;
