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
import { userVoucherApi, rewardsApi, voucherApi, ApiUserVoucher } from '../services/api';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

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

interface AvailableVoucher {
  _id: string;
  code: string;
  discount: number;
  description: string;
  pointsRequired: number;
  expiryDate: string;
  count: number;
  status: string;
  isExchangeable: boolean;
  type: 'free' | 'exchangeable'; // 'free' = không cần đổi điểm, 'exchangeable' = cần đổi điểm
}

const RewardsScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
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

  const [userVouchers, setUserVouchers] = useState<ApiUserVoucher[]>([]);
  const [userVouchersLoading, setUserVouchersLoading] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<AvailableVoucher[]>([]);
  const [availableVouchersLoading, setAvailableVouchersLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUserPoints(token);
      fetchExchangeableVouchers(token);
      checkDailyLogin(token);
      fetchUserVouchers();
      fetchAvailableVouchers();
    }
  }, [isAuthenticated, token]);

  const fetchUserVouchers = async () => {
    if (!token) return;
    
    try {
      setUserVouchersLoading(true);
      const response = await userVoucherApi.getUserVouchers();
      setUserVouchers(response.data.userVouchers);
    } catch (error) {
      console.error('Error fetching user vouchers:', error);
    } finally {
      setUserVouchersLoading(false);
    }
  };

  const fetchAvailableVouchers = async () => {
    if (!token) return;
    
    try {
      setAvailableVouchersLoading(true);
      const response = await voucherApi.getVouchers();
      const allVouchers = response.data.vouchers;
      
      // Phân loại vouchers
      const processedVouchers: AvailableVoucher[] = allVouchers.map(voucher => ({
        ...voucher,
        type: voucher.isExchangeable ? 'exchangeable' : 'free'
      }));
      
      setAvailableVouchers(processedVouchers);
    } catch (error) {
      console.error('Error fetching available vouchers:', error);
    } finally {
      setAvailableVouchersLoading(false);
    }
  };

  const handleExchangeVoucher = async (voucher: Voucher) => {
    if (userPoints < voucher.pointsRequired) {
      Alert.alert('Không đủ điểm', 'Bạn cần thêm điểm để đổi voucher này!');
      return;
    }

    try {
      const result = await rewardsApi.exchangeVoucher(voucher._id);
      Alert.alert(
        'Đổi voucher thành công!',
        `Bạn đã nhận được voucher ${result.data.userVoucher.code} giảm ${voucher.discount}%`,
        [{ text: 'OK' }]
      );
      // Refresh user vouchers and points after exchange
      fetchUserVouchers();
      if (token) {
        fetchUserPoints(token);
        fetchExchangeableVouchers(token);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể đổi voucher');
    }
  };

  const handleGetFreeVoucher = async (voucher: AvailableVoucher) => {
    try {
      const result = await rewardsApi.exchangeVoucher(voucher._id);
      Alert.alert(
        'Nhận voucher thành công!',
        `Bạn đã nhận được voucher ${result.data.userVoucher.code} giảm ${voucher.discount}%`,
        [{ text: 'OK' }]
      );
      // Refresh user vouchers after getting free voucher
      fetchUserVouchers();
      fetchAvailableVouchers();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể nhận voucher');
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
          <TouchableOpacity onPress={() => router.replace('/profile')}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
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
        <TouchableOpacity onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quà tặng</Text>
        <TouchableOpacity onPress={() => router.push('/help')}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
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
          <Text style={styles.sectionTitle}>Voucher khả dụng</Text>
          {availableVouchersLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
          ) : availableVouchers.length === 0 ? (
            <Text style={styles.emptyText}>Không có voucher nào khả dụng</Text>
          ) : (
            availableVouchers.map((voucher: AvailableVoucher) => (
              <View key={voucher._id} style={styles.voucherCard}>
                <View style={styles.voucherHeader}>
                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherCode}>{voucher.code}</Text>
                    <Text style={styles.voucherDiscount}>Giảm {voucher.discount}%</Text>
                  </View>
                  {voucher.type === 'exchangeable' ? (
                    <View style={styles.pointsRequired}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.pointsRequiredText}>{voucher.pointsRequired}</Text>
                    </View>
                  ) : (
                    <View style={styles.freeBadge}>
                      <Ionicons name="gift" size={16} color="#4CAF50" />
                      <Text style={styles.freeBadgeText}>Miễn phí</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.voucherDescription}>{voucher.description}</Text>
                
                <View style={styles.voucherFooter}>
                  <Text style={styles.expiryDate}>Hết hạn: {formatDate(voucher.expiryDate)}</Text>
                  <TouchableOpacity
                    style={[
                      styles.exchangeButton,
                      voucher.type === 'exchangeable' && userPoints < voucher.pointsRequired && styles.exchangeButtonDisabled
                    ]}
                    onPress={() => voucher.type === 'exchangeable' ? handleExchangeVoucher(voucher) : handleGetFreeVoucher(voucher)}
                    disabled={voucher.type === 'exchangeable' && (userPoints < voucher.pointsRequired || isLoading)}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.exchangeButtonText}>
                        {voucher.type === 'exchangeable' 
                          ? (userPoints >= voucher.pointsRequired ? 'Đổi ngay' : 'Không đủ điểm')
                          : 'Nhận ngay'
                        }
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
          {userVouchersLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />
          ) : userVouchers.length > 0 ? (
            userVouchers.map((userVoucher) => (
              <View key={userVoucher._id} style={styles.userVoucherItem}>
                <View style={styles.userVoucherHeader}>
                  <View style={styles.userVoucherInfo}>
                    <Text style={styles.userVoucherCode}>{userVoucher.code}</Text>
                    <Text style={styles.userVoucherDiscount}>Giảm {userVoucher.discount}%</Text>
                  </View>
                  <View style={[
                    styles.userVoucherStatus,
                    userVoucher.status === 'active' && styles.statusActive,
                    userVoucher.status === 'used' && styles.statusUsed,
                    userVoucher.status === 'expired' && styles.statusExpired
                  ]}>
                    <Text style={styles.userVoucherStatusText}>
                      {userVoucher.status === 'active' ? 'Có thể sử dụng' :
                       userVoucher.status === 'used' ? 'Đã sử dụng' : 'Hết hạn'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.userVoucherDescription}>{userVoucher.description}</Text>
                <Text style={styles.userVoucherExpiry}>
                  Hết hạn: {formatDate(userVoucher.expiryDate)}
                </Text>
                {userVoucher.pointsSpent > 0 && (
                  <Text style={styles.userVoucherPoints}>
                    Đã đổi bằng {userVoucher.pointsSpent} điểm
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyVouchers}>
              <Ionicons name="ticket-outline" size={48} color="#ccc" />
              <Text style={styles.emptyVouchersText}>Chưa có voucher nào</Text>
              <Text style={styles.emptyVouchersSubtext}>Đổi voucher để nhận ưu đãi</Text>
            </View>
          )}
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
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
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
  // User Voucher Styles
  userVoucherItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  userVoucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userVoucherInfo: {
    flex: 1,
  },
  userVoucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userVoucherDiscount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  userVoucherStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#e8f5e8',
  },
  statusUsed: {
    backgroundColor: '#fff3cd',
  },
  statusExpired: {
    backgroundColor: '#f8d7da',
  },
  userVoucherStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userVoucherDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userVoucherExpiry: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  userVoucherPoints: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
});

export default RewardsScreen; 