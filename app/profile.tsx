import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { getUserAddresses } from '../services/addressApi';
import { getUserAvatarUrl } from '../utils/userUtils';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout, token } = useAuthStore();
  const { items } = useCartStore();
  const { favorites } = useFavoriteStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  
  // Tính số lượng sản phẩm khác nhau trong giỏ hàng
  const totalCartItems = items.length;
  
  // Tính số lượng sản phẩm yêu thích
  const totalFavorites = favorites.length;

  React.useEffect(() => {
    const loadAddresses = async () => {
      try {
        if (!token) return;
        const userAddresses = await getUserAddresses(token);
        setAddresses(userAddresses);
      } catch (error) {
        console.error('Lỗi khi tải địa chỉ:', error);
      }
    };
    loadAddresses();
  }, [token]);

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/sign-in');
          }
        }
      ]
    );
  };

  const handleManageAddresses = () => {
    router.replace('./select-address');
  };

  const handleEditProfile = () => {
    router.replace('./edit-profile');
  };

  const handleChangePassword = () => {
    router.replace('./change-password');
  };

  const handleViewOrders = () => {
    router.replace('./purchased-orders');
  };

  return (
    <SafeAreaView style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tài khoản</Text>
      </View>

      {/* User Info */}
      <View style={[styles.userSection, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          {getUserAvatarUrl(user?.avatarUrl) ? (
            <Image
              source={{ uri: getUserAvatarUrl(user?.avatarUrl)! }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <Image
              source={require('../assets/images/avatar.png')}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Khách hàng'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'Chưa có email'}</Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user?.phoneNumber || (user as any)?.phoneNumber || 'Chưa có số điện thoại'}</Text>
        </View>
      </View>
      {/* Nút Đăng nhập/Đăng ký cho khách hàng */}
      {(!user || !user._id) && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16, marginTop: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#fff', borderRadius: 4, paddingVertical: 8, paddingHorizontal: 32, marginRight: 8 }}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={{ color: '#469B43', fontWeight: 'bold', fontSize: 16 }}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#fff', borderRadius: 4, paddingVertical: 8, paddingHorizontal: 32 }}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={{ color: '#469B43', fontWeight: 'bold', fontSize: 16 }}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      )}



      {/* Menu Items */}
      <ScrollView style={[styles.menuContainer, { backgroundColor: colors.card }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('./edit-profile')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Chỉnh sửa thông tin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Địa chỉ & Thanh toán</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleManageAddresses}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Quản lý địa chỉ</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.addressCount, { color: colors.accent }]}>{addresses.length} địa chỉ</Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/my-cards')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Thẻ của tôi</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Đơn hàng</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleViewOrders}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="receipt-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Đơn hàng đã mua</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Giao diện sáng/tối</Text>
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon-sharp'} size={24} color={colors.accent} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>{isDark ? 'Giao diện sáng' : 'Giao diện tối'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tính năng</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/rewards')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="gift-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Quà tặng</Text>
            </View>
            <View style={styles.menuItemRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>0</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/cart')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="cart-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Giỏ hàng</Text>
            </View>
            <View style={styles.menuItemRight}>
              {totalCartItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalCartItems > 99 ? '99+' : totalCartItems}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/favorite')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Sản phẩm yêu thích</Text>
            </View>
            <View style={styles.menuItemRight}>
              {totalFavorites > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalFavorites > 99 ? '99+' : totalFavorites}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/notifications')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Thông báo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/settings')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Cài đặt</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hỗ trợ</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/help')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Trợ giúp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/about')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Về ứng dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>
        </View>

        {/* Logout Button - đưa vào trong ScrollView */}
        {user && user._id && (
          <View style={[styles.logoutContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.accent }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressCount: {
    fontSize: 14,
    color: '#469B43',
    marginRight: 8,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

});

export default ProfileScreen; 