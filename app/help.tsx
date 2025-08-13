import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { useRouter } from 'expo-router';

const HelpScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const helpItems = [
    {
      title: 'Cách đặt hàng',
      description: 'Hướng dẫn chi tiết cách đặt hàng và thanh toán',
      icon: 'cart-outline',
    },
    {
      title: 'Chính sách đổi trả',
      description: 'Thông tin về chính sách đổi trả và hoàn tiền',
      icon: 'refresh-outline',
    },
    {
      title: 'Vận chuyển',
      description: 'Thông tin về phí vận chuyển và thời gian giao hàng',
      icon: 'car-outline',
    },
    {
      title: 'Bảo mật thông tin',
      description: 'Chính sách bảo mật thông tin cá nhân',
      icon: 'shield-checkmark-outline',
    },
    {
      title: 'Liên hệ hỗ trợ',
      description: 'Thông tin liên hệ và hỗ trợ khách hàng',
      icon: 'call-outline',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/settings')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trợ giúp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Câu hỏi thường gặp
          </Text>
          
          {helpItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.helpItem, { backgroundColor: colors.card }]}
            >
              <View style={styles.helpItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={colors.accent} />
                </View>
                <View style={styles.helpItemText}>
                  <Text style={[styles.helpItemTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.helpItemDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liên hệ hỗ trợ
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                1900-1234
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                support@strengthbest.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                8:00 - 22:00 (Thứ 2 - Chủ nhật)
              </Text>
            </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  helpItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  helpItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpItemText: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactInfo: {
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default HelpScreen; 