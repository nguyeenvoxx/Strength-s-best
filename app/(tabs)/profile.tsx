import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('userAddresses');
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout }
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
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tài khoản</Text>
      </View>

      {/* User Info */}
      <View style={[styles.userSection, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={colors.accent} />
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Khách hàng'}</Text>
          <Text style={[styles.userEmail, { color: colors.text }]}>{user?.email || 'Chưa có email'}</Text>
          <Text style={[styles.userPhone, { color: colors.text }]}>{user?.phoneNumber || 'Chưa có số điện thoại'}</Text>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.menuSection, { backgroundColor: colors.section, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Chỉnh sửa thông tin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Đổi mật khẩu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.section, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Địa chỉ giao hàng</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleManageAddresses}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Quản lý địa chỉ</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.addressCount, { color: colors.accent }]}>{addresses.length} địa chỉ</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.section, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Đơn hàng</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handleViewOrders}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="receipt-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Đơn hàng đã mua</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.section, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Giao diện sáng/tối</Text>
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny' : 'moon-sharp'} size={24} color={colors.accent} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>{isDark ? 'Giao diện sáng' : 'Giao diện tối'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.section, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hỗ trợ</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Trợ giúp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Về ứng dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.border} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={[styles.logoutContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
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
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
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
