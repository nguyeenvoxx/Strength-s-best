import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface TrendingProductItemProps {
    image: any;
    title: string;
    price: string;
    originalPrice: string;
    discount: string;
    onPress?: () => void;
}

const TrendingProductItem: React.FC<TrendingProductItemProps> = ({
    image,
    title,
    price,
    originalPrice,
    discount,
    onPress,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image source={image} style={styles.productImage} />
            <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.price}>{price}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>{originalPrice}</Text>
                    <Text style={styles.discountText}>{discount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 160,
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
    productImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
});

export default TrendingProductItem;
