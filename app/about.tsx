import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { useRouter } from 'expo-router';

const AboutScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const aboutInfo = [
    {
      title: 'Sứ mệnh',
      description: 'Cung cấp các sản phẩm thực phẩm chức năng chất lượng cao, giúp người dùng có sức khỏe tốt nhất.',
      icon: 'star-outline',
    },
    {
      title: 'Tầm nhìn',
      description: 'Trở thành thương hiệu hàng đầu trong lĩnh vực thực phẩm chức năng tại Việt Nam.',
      icon: 'eye-outline',
    },
    {
      title: 'Giá trị cốt lõi',
      description: 'Chất lượng, uy tín, sự tin cậy và cam kết với sức khỏe cộng đồng.',
      icon: 'heart-outline',
    },
  ];

  const companyInfo = [
    {
      label: 'Tên công ty',
      value: 'Strength Best JSC',
    },
    {
      label: 'Địa chỉ',
      value: '123 Đường ABC, Quận 1, TP.HCM',
    },
    {
      label: 'Điện thoại',
      value: '1900-1234',
    },
    {
      label: 'Email',
      value: 'info@strengthbest.com',
    },
    {
      label: 'Website',
      value: 'www.strengthbest.com',
    },
    {
      label: 'Giấy phép',
      value: 'GPKD: 0123456789',
    },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Về chúng tôi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={[styles.logoSection, { backgroundColor: colors.card }]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.text }]}>Strength Best</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Phiên bản 1.0.0</Text>
        </View>

        {/* About Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin công ty
          </Text>
          
          {aboutInfo.map((item, index) => (
            <View key={index} style={[styles.aboutItem, { backgroundColor: colors.card }]}>
              <View style={styles.aboutItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={colors.accent} />
                </View>
                <View style={styles.aboutItemText}>
                  <Text style={[styles.aboutItemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.aboutItemDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Company Details */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin liên hệ
          </Text>
          <View style={styles.companyInfo}>
            {companyInfo.map((item, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {item.label}:
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Media */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Kết nối với chúng tôi
          </Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="logo-facebook" size={24} color={colors.accent} />
              <Text style={[styles.socialText, { color: colors.text }]}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="logo-instagram" size={24} color={colors.accent} />
              <Text style={[styles.socialText, { color: colors.text }]}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="logo-youtube" size={24} color={colors.accent} />
              <Text style={[styles.socialText, { color: colors.text }]}>YouTube</Text>
            </TouchableOpacity>
          </View>
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
  logoSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  aboutItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  aboutItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aboutItemText: {
    flex: 1,
  },
  aboutItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  companyInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  socialButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  socialText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default AboutScreen; 