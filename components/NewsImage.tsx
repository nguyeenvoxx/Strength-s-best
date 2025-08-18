import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getNewsImageUrl } from '../utils/newsUtils';

interface NewsImageProps {
  imagePath?: string;
  style?: any;
  fallbackText?: string;
  showLoading?: boolean;
}

const NewsImage: React.FC<NewsImageProps> = ({ 
  imagePath, 
  style, 
  fallbackText = 'Tin tức',
  showLoading = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUrl = getNewsImageUrl(imagePath);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, style]}
        resizeMode="cover"
        defaultSource={require('../assets/images/logo.png')}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {showLoading && isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NewsImage;


