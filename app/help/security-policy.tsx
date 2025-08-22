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
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const SecurityPolicyScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const securityMeasures = [
    {
      title: 'Mã hóa SSL/TLS',
      description: 'Tất cả dữ liệu được mã hóa bằng SSL/TLS 256-bit',
      icon: 'shield-checkmark-outline',
    },
    {
      title: 'Bảo mật thanh toán',
      description: 'Thông tin thanh toán được bảo vệ bởi các tiêu chuẩn PCI DSS',
      icon: 'card-outline',
    },
    {
      title: 'Xác thực 2 lớp',
      description: 'Hỗ trợ xác thực 2 lớp cho tài khoản người dùng',
      icon: 'lock-closed-outline',
    },
    {
      title: 'Bảo vệ dữ liệu',
      description: 'Dữ liệu cá nhân được lưu trữ an toàn và không chia sẻ với bên thứ 3',
      icon: 'server-outline',
    },
  ];

  const dataCollection = [
    {
      type: 'Thông tin cá nhân',
      items: ['Họ và tên', 'Email', 'Số điện thoại', 'Địa chỉ giao hàng'],
      icon: 'person-outline',
    },
    {
      type: 'Thông tin thanh toán',
      items: ['Thông tin thẻ tín dụng (được mã hóa)', 'Lịch sử giao dịch'],
      icon: 'card-outline',
    },
    {
      type: 'Thông tin sử dụng',
      items: ['Lịch sử mua hàng', 'Sản phẩm yêu thích', 'Đánh giá sản phẩm'],
      icon: 'analytics-outline',
    },
  ];

  const dataUsage = [
    {
      purpose: 'Xử lý đơn hàng',
      description: 'Sử dụng thông tin để xử lý và giao hàng',
      icon: 'bag-outline',
    },
    {
      purpose: 'Dịch vụ khách hàng',
      description: 'Hỗ trợ và giải đáp thắc mắc của khách hàng',
      icon: 'headset-outline',
    },
    {
      purpose: 'Cải thiện dịch vụ',
      description: 'Phân tích để cải thiện trải nghiệm người dùng',
      icon: 'trending-up-outline',
    },
    {
      purpose: 'Marketing',
      description: 'Gửi thông tin khuyến mãi (có thể từ chối)',
      icon: 'megaphone-outline',
    },
  ];

  const userRights = [
    {
      right: 'Quyền truy cập',
      description: 'Xem và cập nhật thông tin cá nhân của mình',
      icon: 'eye-outline',
    },
    {
      right: 'Quyền xóa',
      description: 'Yêu cầu xóa thông tin cá nhân khỏi hệ thống',
      icon: 'trash-outline',
    },
    {
      right: 'Quyền từ chối',
      description: 'Từ chối nhận thông tin marketing',
      icon: 'close-circle-outline',
    },
    {
      right: 'Quyền khiếu nại',
      description: 'Khiếu nại về việc xử lý dữ liệu cá nhân',
      icon: 'document-text-outline',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/help')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chính sách bảo mật</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Chính sách bảo mật thông tin
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Strength's Best cam kết bảo vệ thông tin cá nhân của bạn. Chúng tôi tuân thủ các quy định về bảo mật dữ liệu và sử dụng các biện pháp bảo mật tiên tiến.
          </Text>
        </View>

        {/* Security Measures */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Biện pháp bảo mật
          </Text>
          
          {securityMeasures.map((measure, index) => (
            <View key={index} style={[styles.measureCard, { backgroundColor: colors.card }]}>
              <View style={styles.measureContent}>
                <Ionicons name={measure.icon as any} size={24} color={colors.accent} />
                <View style={styles.measureInfo}>
                  <Text style={[styles.measureTitle, { color: colors.text }]}>
                    {measure.title}
                  </Text>
                  <Text style={[styles.measureDescription, { color: colors.textSecondary }]}>
                    {measure.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin chúng tôi thu thập
          </Text>
          
          {dataCollection.map((collection, index) => (
            <View key={index} style={[styles.collectionCard, { backgroundColor: colors.card }]}>
              <View style={styles.collectionHeader}>
                <Ionicons name={collection.icon as any} size={24} color={colors.accent} />
                <Text style={[styles.collectionTitle, { color: colors.text }]}>
                  {collection.type}
                </Text>
              </View>
              <View style={styles.itemsList}>
                {collection.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Ionicons name="checkmark" size={16} color={colors.accent} />
                    <Text style={[styles.itemText, { color: colors.textSecondary }]}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Data Usage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mục đích sử dụng thông tin
          </Text>
          
          {dataUsage.map((usage, index) => (
            <View key={index} style={[styles.usageCard, { backgroundColor: colors.card }]}>
              <View style={styles.usageContent}>
                <Ionicons name={usage.icon as any} size={24} color={colors.accent} />
                <View style={styles.usageInfo}>
                  <Text style={[styles.usageTitle, { color: colors.text }]}>
                    {usage.purpose}
                  </Text>
                  <Text style={[styles.usageDescription, { color: colors.textSecondary }]}>
                    {usage.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* User Rights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quyền của người dùng
          </Text>
          
          {userRights.map((right, index) => (
            <View key={index} style={[styles.rightCard, { backgroundColor: colors.card }]}>
              <View style={styles.rightContent}>
                <Ionicons name={right.icon as any} size={24} color={colors.accent} />
                <View style={styles.rightInfo}>
                  <Text style={[styles.rightTitle, { color: colors.text }]}>
                    {right.right}
                  </Text>
                  <Text style={[styles.rightDescription, { color: colors.textSecondary }]}>
                    {right.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Data Retention */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thời gian lưu trữ dữ liệu
          </Text>
          <View style={styles.retentionInfo}>
            <View style={styles.retentionItem}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Text style={[styles.retentionText, { color: colors.textSecondary }]}>
                Thông tin tài khoản: Lưu trữ cho đến khi bạn yêu cầu xóa
              </Text>
            </View>
            <View style={styles.retentionItem}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Text style={[styles.retentionText, { color: colors.textSecondary }]}>
                Lịch sử giao dịch: Lưu trữ trong 5 năm theo quy định
              </Text>
            </View>
            <View style={styles.retentionItem}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Text style={[styles.retentionText, { color: colors.textSecondary }]}>
                Dữ liệu marketing: Có thể từ chối bất cứ lúc nào
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liên hệ về bảo mật
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Email: privacy@strengthbest.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 1900-1234
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
              </Text>
            </View>
          </View>
        </View>

        {/* Last Updated */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Cập nhật lần cuối: 01/01/2024
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  measureCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  measureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  measureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  collectionCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  itemsList: {
    marginLeft: 36,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  usageCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  usageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageInfo: {
    flex: 1,
    marginLeft: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  usageDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  rightCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  retentionInfo: {
    padding: 16,
  },
  retentionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  retentionText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
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
  lastUpdated: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 16,
  },
});

export default SecurityPolicyScreen;





