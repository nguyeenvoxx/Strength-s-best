import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { getUserCards, setDefaultCard, deleteCard, Card, syncStripePaymentMethods } from '../services/cardApi';

const MyCardsScreen: React.FC = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  // Support optimistic refresh when trở về từ add-card/verify-card
  useFocusEffect(
    React.useCallback(() => {
      loadCards();
    }, [])
  );

  const loadCards = async () => {
    try {
      setLoading(true);
  
      const cards = await getUserCards(token!);
      // Nếu chưa có thẻ nào, thử đồng bộ từ Stripe (fallback khi webhook chưa tới)
      if (!cards || cards.length === 0) {
        try {
          await syncStripePaymentMethods(token!);
          const synced = await getUserCards(token!);
          setCards(synced);
        } catch (e) {
          setCards(cards || []);
        }
      } else {
        setCards(cards);
      }
    } catch (error: any) {
      console.error('Error loading cards:', error);
      Alert.alert('Thông báo', 'Không thể tải danh sách thẻ');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await setDefaultCard(token!, cardId);
      await loadCards();
      Alert.alert('Thành công', 'Đã đặt thẻ làm mặc định');
    } catch (error: any) {
      console.error('Error setting default card:', error);
      Alert.alert('Thông báo', error.message || 'Không thể đặt thẻ mặc định');
    }
  };

  const handleDeleteCard = async (cardId: string, maskedNumber: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa thẻ ${maskedNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCard(token!, cardId);
              await loadCards();
              Alert.alert('Thành công', 'Đã xóa thẻ');
            } catch (error: any) {
              console.error('Error deleting card:', error);
              Alert.alert('Thông báo', error.message || 'Không thể xóa thẻ');
            }
          }
        }
      ]
    );
  };

  const getCardIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  const getCardColor = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return '#1a1f71';
      case 'mastercard':
        return '#eb001b';
      case 'amex':
        return '#006fcf';
      default:
        return colors.primary || colors.accent;
    }
  };

  const renderCard = ({ item }: { item: Card }) => (
    <View style={[styles.cardContainer, { backgroundColor: colors.card }]}>
      {/* Card Visual */}
      <View style={[styles.cardVisual, { backgroundColor: getCardColor(item.cardType) }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardType}>{item.cardType.toUpperCase()}</Text>
          <Ionicons name={getCardIcon(item.cardType)} size={28} color="#fff" />
        </View>
        
        <Text style={styles.cardNumber}>{item.maskedCardNumber}</Text>
        
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.cardLabel}>Chủ thẻ</Text>
            <Text style={styles.cardHolder}>{item.cardHolder}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Hết hạn</Text>
            <Text style={styles.cardExpiry}>{item.expiryDate}</Text>
          </View>
        </View>
        
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Mặc định</Text>
          </View>
        )}
      </View>

      {/* Card Actions */}
      <View style={styles.cardActions}>
        <View style={styles.cardInfo}>
          <View style={styles.statusContainer}>
            {item.isVerified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                <Text style={[styles.statusText, { color: '#28a745' }]}>Đã xác minh</Text>
              </View>
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="time" size={16} color="#ffa500" />
                <Text style={[styles.statusText, { color: '#ffa500' }]}>Chờ xác minh</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          {!item.isDefault && item.isVerified && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.accent }]}
              onPress={() => handleSetDefault(item._id)}
            >
              <Text style={styles.actionButtonText}>Đặt mặc định</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCard(item._id, item.maskedCardNumber)}
          >
            <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang tải danh sách thẻ...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/profile')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thẻ của tôi</Text>
        <TouchableOpacity onPress={async () => { setLoading(true); try { await syncStripePaymentMethods(token!); await loadCards(); } finally { setLoading(false); } }} style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {cards.length === 0 ? (
        <View style={[styles.emptyContainer, styles.centered]}>
          <Ionicons name="card-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Chưa có thẻ nào
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Thêm thẻ tín dụng để thanh toán nhanh chóng và tiện lợi
          </Text>
          <TouchableOpacity
            style={[styles.addCardButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/add-card')}
          >
            <Text style={styles.addCardButtonText}>Thêm thẻ mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.cardsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  cardsList: {
    padding: 16,
    paddingBottom: 120,
  },
  cardContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardVisual: {
    padding: 20,
    minHeight: 160,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardType: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardHolder: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardExpiry: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  defaultBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addCardButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyCardsScreen;