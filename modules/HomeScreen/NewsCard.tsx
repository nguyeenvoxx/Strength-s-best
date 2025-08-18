import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import NewsImage from '../../components/NewsImage';

interface NewsCardProps {
  image: any;
  title: string;
  date: string;
  newsId?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ image, title, date, newsId }) => {
  const router = useRouter();

  const handlePress = () => {
    if (newsId) {
      router.push({
        pathname: '/news-detail',
        params: { newsId }
      } as any);
    } else {
      // Fallback to news list if no specific news ID
      router.push('/news');
    }
  };

  return (
    <TouchableOpacity style={styles.newsCard} onPress={handlePress}>
      <NewsImage 
        imagePath={image.uri} 
        style={styles.newsImage}
        fallbackText="Tin tức"
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{title}</Text>
        <Text style={styles.newsDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default NewsCard;
