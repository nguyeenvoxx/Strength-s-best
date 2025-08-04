import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useAuthStore } from '../store/useAuthStore';
import { useVoucherStore } from '../store/useVoucherStore';

interface Voucher {
  _id: string;
  code: string;
  discount: number;
  description: string;
  pointsRequired: number;
  expiryDate: string;
  count: number;
  status: string;
  isExchangeable: boolean;
}

const RewardsScreen: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, token } = useAuthStore();
  const { 
    exchangeableVouchers, 
    userPoints, 
    totalSpent, 
    reviewCount,
    isLoading, 
    error,
    fetchExchangeableVouchers,
    fetchUserPoints,
    exchangeVoucher,
    checkDailyLogin
  } = useVoucherStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserPoints(token);
      fetchExchangeableVouchers(token);
      checkDailyLogin(token);
    }
  }, [isAuthenticated, token]);

  const handleExchangeVoucher = async (voucher: Voucher) => {
    if (userPoints < voucher.pointsRequired) {
      Alert.alert('Không đủ điểm', 'Bạn cần thêm điểm để đổi voucher này!');
      return;
    }

    try {
      const result = await exchangeVoucher(voucher._id);
      Alert.alert(
        'Đổi voucher thành công!',
        `Bạn đã nhận được voucher ${voucher.code} giảm ${voucher.discount}%`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể đổi voucher');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, getPlatformContainerStyle()]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quà tặng</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loginPromptContainer}>
          <Ionicons name="gift-outline" size={48} color="#4CAF50" />
          <Text style={styles.loginPromptTitle}>Đăng nhập để nhận quà</Text>
          <Text style={styles.loginPromptText}>Đăng nhập để tích điểm và đổi voucher</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quà tặng</Text>
        <TouchableOpacity onPress={() => router.push('/help')}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.pointsTitle}>Điểm tích lũy</Text>
          </View>
          <Text style={styles.pointsValue}>{userPoints.toLocaleString()}</Text>
          <Text style={styles.pointsSubtitle}>Điểm có thể đổi voucher</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="card" size={16} color="#4CAF50" />
              <Text style={styles.statText}>{formatCurrency(totalSpent)}</Text>
              <Text style={styles.statLabel}>Tổng chi tiêu</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#4CAF50" />
              <Text style={styles.statText}>{reviewCount}</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
          </View>
        </View>

        {/* How to earn points */}
        <View style={styles.earnPointsSection}>
          <Text style={styles.sectionTitle}>Cách tích điểm</Text>
          <View style={styles.earnPointsList}>
            <View style={styles.earnPointItem}>
              <Ionicons name="cart" size={20} color="#4CAF50" />
              <Text style={styles.earnPointText}>Mua hàng: 1 điểm / 10,000đ</Text>
            </View>
            <View style={styles.earnPointItem}>
              <Ionicons name="star" size={20} color="#4CAF50" />
              <Text style={styles.earnPointText}>Đánh giá sản phẩm: 5 điểm</Text>
            </View>
            
            <View style={styles.earnPointItem}>
              <Ionicons name="calendar" size={20} color="#4CAF50" />
              <Text style={styles.earnPointText}>Đăng nhập hàng ngày: 1 điểm</Text>
            </View>
          </View>
        </View>

        {/* Available Vouchers */}
        <View style={styles.vouchersSection}>
          <Text style={styles.sectionTitle}>Voucher có thể đổi</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : exchangeableVouchers.length === 0 ? (
            <Text style={styles.emptyText}>Không có voucher nào khả dụng</Text>
          ) : (
            exchangeableVouchers.map((voucher: Voucher) => (
              <View key={voucher._id} style={styles.voucherCard}>
                <View style={styles.voucherHeader}>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    <Text style={styles.voucherDiscount}>Giảm {voucher.discount}%</Text>
                  </View>
                  <View style={styles.pointsRequired}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.pointsRequiredText}>{voucher.pointsRequired}</Text>
                  </View>
                </View>
                
                <Text style={styles.voucherDescription}>{voucher.description}</Text>
                
                <View style={styles.voucherFooter}>
                  <Text style={styles.expiryDate}>Hết hạn: {formatDate(voucher.expiryDate)}</Text>
                  <TouchableOpacity
                    style={[
                      styles.exchangeButton,
                      userPoints < voucher.pointsRequired && styles.exchangeButtonDisabled
                    ]}
                    onPress={() => handleExchangeVoucher(voucher)}
                    disabled={userPoints < voucher.pointsRequired || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.exchangeButtonText}>
                        {userPoints >= voucher.pointsRequired ? 'Đổi ngay' : 'Không đủ điểm'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* My Vouchers */}
        <View style={styles.myVouchersSection}>
          <Text style={styles.sectionTitle}>Voucher của tôi</Text>
          <View style={styles.emptyVouchers}>
            <Ionicons name="ticket-outline" size={48} color="#ccc" />
            <Text style={styles.emptyVouchersText}>Chưa có voucher nào</Text>
            <Text style={styles.emptyVouchersSubtext}>Đổi voucher để nhận ưu đãi</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  pointsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  pointsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  earnPointsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  earnPointsList: {
    gap: 12,
  },
  earnPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnPointText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  vouchersSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loading: {
    paddingVertical: 20,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  voucherCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voucherInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voucherDiscount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  pointsRequired: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsRequiredText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  voucherDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  voucherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryDate: {
    fontSize: 12,
    color: '#999',
  },
  exchangeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exchangeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  exchangeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  myVouchersSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyVouchers: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyVouchersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  emptyVouchersSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RewardsScreen; 