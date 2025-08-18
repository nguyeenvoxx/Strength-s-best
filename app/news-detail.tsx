import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { getNewsDetail, NewsItem } from '../services/newsApi';
import { formatNewsDateDetailed } from '../utils/newsUtils';
import NewsImage from '../components/NewsImage';

const { width } = Dimensions.get('window');

const NewsDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? DarkColors : LightColors;

  const [newsDetail, setNewsDetail] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (params.newsId) {
      loadNewsDetail();
    }
  }, [params.newsId]);

  const loadNewsDetail = async () => {
    try {
      setLoading(true);
      const newsId = params.newsId as string;
      const newsData = await getNewsDetail(newsId);
      setNewsDetail(newsData);
    } catch (error) {
      console.error('Error loading news detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết tin tức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${newsDetail?.title}\n\n${newsDetail?.content.substring(0, 100)}...\n\nĐọc thêm tại ứng dụng của chúng tôi.`,
        title: newsDetail?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };



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

  if (!newsDetail) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            Không tìm thấy tin tức
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết tin tức</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* News Image */}
        <NewsImage
          imagePath={newsDetail.image}
          style={styles.newsImage}
          fallbackText="Tin tức"
        />

        {/* News Content */}
        <View style={[styles.contentContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.newsTitle, { color: colors.text }]}>
            {newsDetail.title}
          </Text>
          
          <View style={styles.newsMeta}>
            <Text style={[styles.newsDate, { color: colors.textSecondary }]}>
              {formatNewsDateDetailed(newsDetail.createdAt)}
            </Text>
            {newsDetail.createdBy && (
              <Text style={[styles.newsAuthor, { color: colors.textSecondary }]}>
                Bởi {newsDetail.createdBy.name}
              </Text>
            )}
          </View>

          <Text style={[styles.newsContent, { color: colors.text }]}>
            {newsDetail.content}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, isLiked && styles.actionButtonActive]}
              onPress={handleLike}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#ff4757" : colors.textSecondary} 
              />
              <Text style={[styles.actionText, { color: isLiked ? "#ff4757" : colors.textSecondary }]}>
                {isLiked ? "Đã thích" : "Thích"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
              onPress={handleBookmark}
            >
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isBookmarked ? colors.accent : colors.textSecondary} 
              />
              <Text style={[styles.actionText, { color: isBookmarked ? colors.accent : colors.textSecondary }]}>
                {isBookmarked ? "Đã lưu" : "Lưu"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                Chia sẻ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  newsImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
  },
  newsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 16,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  newsDate: {
    fontSize: 14,
  },
  newsAuthor: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  newsContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(70, 155, 67, 0.1)',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NewsDetailScreen;
