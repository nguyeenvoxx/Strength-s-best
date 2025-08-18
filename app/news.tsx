import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../store/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';
import { LightColors, DarkColors } from '../constants/Colors';
import { getNewsList, NewsItem } from '../services/newsApi';
import { formatNewsDate } from '../utils/newsUtils';
import NewsImage from '../components/NewsImage';

const { width } = Dimensions.get('window');

const NewsScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { token } = useAuthStore();
  const colors = theme === 'dark' ? DarkColors : LightColors;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await getNewsList({ page: 1, limit: 20 });
      setNews(newsData);
      setHasMore(newsData.length === 20);
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Lỗi', 'Không thể tải tin tức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleNewsPress = (newsItem: NewsItem) => {
    router.push({
      pathname: '/news-detail',
      params: { newsId: newsItem._id }
    } as any);
  };



  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={[styles.newsItem, { backgroundColor: colors.card }]}
      onPress={() => handleNewsPress(item)}
    >
      <NewsImage
        imagePath={item.image}
        style={styles.newsImage}
        fallbackText="Tin tức"
      />
      <View style={styles.newsContent}>
        <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.newsExcerpt, { color: colors.textSecondary }]} numberOfLines={3}>
          {item.content}
        </Text>
        <View style={styles.newsFooter}>
          <Text style={[styles.newsDate, { color: colors.textSecondary }]}>
            {formatNewsDate(item.createdAt)}
          </Text>
          <View style={styles.newsActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Đang tải tin tức...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tin tức</Text>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* News List */}
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.newsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Chưa có tin tức nào
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  newsList: {
    padding: 16,
  },
  newsItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
  },
  newsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});

export default NewsScreen;
