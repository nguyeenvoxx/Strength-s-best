import { StyleSheet, Text, View, ScrollView, Dimensions, Image, TouchableOpacity, ImageSourcePropType } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { PRODUCT_ITEM_SAMPLE } from '../../constants/app.constant'


const { width } = Dimensions.get('window')

interface SectionItem {
  text: string
  hasBullet: boolean
}

interface Section {
  title: string
  items: SectionItem[]
}

const ProductScreen = () => {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const product = PRODUCT_ITEM_SAMPLE
  const productImages = product.images as ImageSourcePropType[]
  const productTitle = product.title
  const rating = product.rating
  const price = product.price
  const sections: Section[] = product.sections.map((section: any) => ({
    title: section.title,
    items: section.items.map((text: any, idx: any) => {
      const isNoBullet = text.endsWith(':') || idx === 0;
      return { text, hasBullet: !isNoBullet };
    })
  }))

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffset / width)
    setCurrentImageIndex(index)
  }

  const renderSectionItem = (item: SectionItem, index: number) => {
    return (
      <View key={index} style={styles.sectionItem}>
        {item.hasBullet && <Text style={styles.bullet}>• </Text>}
        <Text style={[styles.itemText, !item.hasBullet && styles.itemTextNoBullet]}>
          {item.text}
        </Text>
      </View>
    )
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Carousel */}
      <View style={styles.carouselContainer}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>

        {/* Heart Button */}
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={24} color="#000000" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {productImages.map((image, index) => (
            <Image key={index} source={image} style={styles.carouselImage} />
          ))}
        </ScrollView>

        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {productImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentImageIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>

      {/* Title and Rating */}
      <View style={styles.titleContainer}>
        <View style={styles.titleRatingRow}>
          <Text style={styles.title}>{productTitle}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.ratingText}>{rating}</Text></View>
        </View>
        
        {/* Price Button */}
        <TouchableOpacity style={styles.priceButton} onPress={() => router.push('../checkout')}>
          <Text style={styles.priceText}>{price}</Text>
        </TouchableOpacity>
      </View>

      {/* Description Sections */}
      <View style={styles.sectionsContainer}>
        {sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSectionItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carouselContainer: {
    height: 300,
    position: 'relative',
  },
  carouselImage: {
    width: width,
    height: 300,
    resizeMode: 'contain',
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heartButton: {
    position: 'absolute',
    top: 20,
    right: 15,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  titleContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titleRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    borderWidth: 1,
    borderColor: '#F57F17',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '600',
  },
  priceButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 15,
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    paddingBottom: 5,
  },
  sectionContent: {
    paddingLeft: 5,
  },
  sectionItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#333333',
    marginRight: 8,
    lineHeight: 24,
  },
  itemText: {
    fontSize: 16,
    color: '#555555',
    lineHeight: 24,
    flex: 1,
  },
  itemTextNoBullet: {
    fontStyle: 'italic',
    color: '#777777',
  },
});

export default ProductScreen;
