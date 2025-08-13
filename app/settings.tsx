import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuthStore();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(true);

  const settingsSections = [
    {
      title: 'Tài khoản',
      items: [
        {
          title: 'Thông tin cá nhân',
          subtitle: 'Cập nhật thông tin cá nhân',
          icon: 'person-outline',
          onPress: () => router.replace('/edit-profile'),
        },
        {
          title: 'Đổi mật khẩu',
          subtitle: 'Thay đổi mật khẩu tài khoản',
          icon: 'lock-closed-outline',
          onPress: () => router.replace('/change-password'),
        },
        {
          title: 'Địa chỉ giao hàng',
          subtitle: 'Quản lý địa chỉ giao hàng',
          icon: 'location-outline',
          onPress: () => router.replace('/add-address'),
        },
      ],
    },
    {
      title: 'Bảo mật',
      items: [
        {
          title: 'Đăng nhập sinh trắc học',
          subtitle: 'Sử dụng vân tay hoặc Face ID',
          icon: 'finger-print-outline',
          type: 'switch',
          value: biometricEnabled,
          onValueChange: setBiometricEnabled,
        },
        {
          title: 'Tự động đăng nhập',
          subtitle: 'Giữ đăng nhập khi khởi động app',
          icon: 'log-in-outline',
          type: 'switch',
          value: autoLoginEnabled,
          onValueChange: setAutoLoginEnabled,
        },
      ],
    },
    {
      title: 'Thông báo',
      items: [
        {
          title: 'Thông báo đẩy',
          subtitle: 'Nhận thông báo từ ứng dụng',
          icon: 'notifications-outline',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Giao diện',
      items: [
        {
          title: 'Chế độ tối',
          subtitle: 'Bật/tắt giao diện tối',
          icon: 'moon-outline',
          type: 'switch',
          value: isDark,
          onValueChange: toggleTheme,
        },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        {
          title: 'Trợ giúp',
          subtitle: 'Hướng dẫn sử dụng',
          icon: 'help-circle-outline',
          onPress: () => router.replace('/help'),
        },
        {
          title: 'Về chúng tôi',
          subtitle: 'Thông tin về ứng dụng',
          icon: 'information-circle-outline',
          onPress: () => router.replace('/about'),
        },
        {
          title: 'Đánh giá ứng dụng',
          subtitle: 'Đánh giá trên App Store',
          icon: 'star-outline',
          onPress: () => {
            // Mở App Store để đánh giá
            Alert.alert('Đánh giá', 'Mở App Store để đánh giá ứng dụng?');
          },
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  const renderSettingItem = (item: any) => {
    if (item.type === 'switch') {
      return (
        <View key={item.title} style={[styles.settingItem, { backgroundColor: colors.card }]}>
          <View style={styles.settingItemContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name={item.icon as any} size={20} color={colors.accent} />
            </View>
            <View style={styles.settingItemText}>
              <Text style={[styles.settingItemTitle, { color: colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={item.value ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.title}
        style={[styles.settingItem, { backgroundColor: colors.card }]}
        onPress={item.onPress}
      >
        <View style={styles.settingItemContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name={item.icon as any} size={20} color={colors.accent} />
          </View>
          <View style={styles.settingItemText}>
            <Text style={[styles.settingItemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cài đặt</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            {section.items.map((item) => renderSettingItem(item))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.danger }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Phiên bản 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
  },
});

export default SettingsScreen;
