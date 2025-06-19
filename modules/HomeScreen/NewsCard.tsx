import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface NewsCardProps {
  image: any;
  title: string;
  date: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ image, title, date }) => (
  <View style={styles.newsCard}>
    <Image source={image} style={styles.newsImage} />
    <View style={styles.newsContent}>
      <Text style={styles.newsTitle}>{title}</Text>
      <Text style={styles.newsDate}>{date}</Text>
    </View>
  </View>
);

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
