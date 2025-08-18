import React, { useState } from 'react';
import { Image, ImageProps, View, Text, StyleSheet } from 'react-native';
import { getNewsImageUrl } from '../utils/newsUtils';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackText?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  uri, 
  fallbackText = 'Tin tức',
  style,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !uri) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getNewsImageUrl(uri) }}
      style={style}
      onError={handleError}
      defaultSource={require('../assets/images/logo.png')}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
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

export default SafeImage;
