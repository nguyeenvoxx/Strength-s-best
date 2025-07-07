import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity ,Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DailyDealItemProps {
  image: any;
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  rating: number;
  reviewCount: number;
  onPress?: () => void;
}

const DailyDealItem: React.FC<DailyDealItemProps> = ({
  image,
  title,
  description,
  price,
  originalPrice,
  discount,
  rating,
  reviewCount,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => {
        console.log('🔍 DEBUG DailyDealItem: TouchableOpacity được nhấn');
        console.log('🔍 DEBUG DailyDealItem: onPress function:', typeof onPress);
        if (onPress) {
          console.log('🔍 DEBUG DailyDealItem: Gọi onPress...');
          onPress();
        } else {
          console.log('❌ DEBUG DailyDealItem: onPress không tồn tại!');
        }
      }}
      activeOpacity={0.7}
    >
      <Image source={image} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.description} numberOfLines={1}>{description}</Text>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.originalPrice}>{originalPrice}</Text>
          <Text style={styles.discountText}>{discount}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{typeof rating === 'number' ? rating.toFixed(1) : '5.0'}</Text>
          <Text style={styles.reviewCount}>({reviewCount || 0})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 12,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#222',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
});

export default DailyDealItem;
