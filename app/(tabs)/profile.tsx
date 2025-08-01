import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  React.useEffect(() => {
    const loadAddresses = async () => { // hàm này để tải địa chỉ từ AsyncStorage
      try {
        const userId = user?._id || (user as any)?.id;
        if (!userId) return;
        const savedAddresses = await AsyncStorage.getItem(`userAddresses_${userId}`);
        if (savedAddresses) {
          setAddresses(JSON.parse(savedAddresses));
        }
      } catch (error) {
        console.error('Lỗi khi tải địa chỉ:', error);
      }
    };
    loadAddresses();
  }, [user?._id]);

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
    router.push('/select-address');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleViewOrders = () => {
    router.push('/purchased-orders');
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tài khoản</Text>
      </View>

      {/* User Info */}
      <View style={[styles.userSection, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          {user?.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          ) : (
            <Image
              source={require('../../assets/images/avatar.png')}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Khách hàng'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'Chưa có email'}</Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>{user?.phone || (user as any)?.phoneNumber || 'Chưa có số điện thoại'}</Text>
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
      <ScrollView style={[styles.menuContainer, { backgroundColor: colors.card }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.menuSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Địa chỉ giao hàng</Text>

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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hỗ trợ</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Trợ giúp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Về ứng dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#fff' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Button */}
      {/* <View style={[styles.logoutContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
     </View> */}
     
      {user && user._id && (
        <View style={[styles.logoutContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  logoutContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutButton: {
    backgroundColor: '#7ED957',
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
