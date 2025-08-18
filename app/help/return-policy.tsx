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

const ReturnPolicyScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const returnConditions = [
    {
      title: 'Thời gian đổi trả',
      description: '30 ngày kể từ ngày nhận hàng',
      icon: 'time-outline',
    },
    {
      title: 'Điều kiện sản phẩm',
      description: 'Sản phẩm còn nguyên vẹn, chưa sử dụng, còn hạn sử dụng',
      icon: 'checkmark-circle-outline',
    },
    {
      title: 'Bao bì gốc',
      description: 'Còn đầy đủ bao bì, nhãn mác, phụ kiện đi kèm',
      icon: 'cube-outline',
    },
    {
      title: 'Hóa đơn mua hàng',
      description: 'Có hóa đơn hoặc mã đơn hàng hợp lệ',
      icon: 'receipt-outline',
    },
  ];

  const returnReasons = [
    {
      reason: 'Sản phẩm bị lỗi từ nhà sản xuất',
      policy: 'Đổi trả miễn phí, hoàn tiền 100%',
      icon: 'alert-circle-outline',
    },
    {
      reason: 'Sản phẩm không đúng mô tả',
      policy: 'Đổi trả miễn phí, hoàn tiền 100%',
      icon: 'information-circle-outline',
    },
    {
      reason: 'Sản phẩm bị hư hỏng khi vận chuyển',
      policy: 'Đổi trả miễn phí, hoàn tiền 100%',
      icon: 'car-crash-outline',
    },
    {
      reason: 'Khách hàng không hài lòng',
      policy: 'Đổi trả trong 7 ngày, phí vận chuyển khách hàng chịu',
      icon: 'thumbs-down-outline',
    },
  ];

  const returnProcess = [
    {
      step: '1',
      title: 'Liên hệ hỗ trợ',
      description: 'Gọi hotline hoặc chat với CSKH để báo đổi trả',
    },
    {
      step: '2',
      title: 'Chụp ảnh sản phẩm',
      description: 'Chụp ảnh sản phẩm và bao bì để xác nhận tình trạng',
    },
    {
      step: '3',
      title: 'Gửi sản phẩm',
      description: 'Đóng gói và gửi sản phẩm về kho của chúng tôi',
    },
    {
      step: '4',
      title: 'Kiểm tra và xử lý',
      description: 'Chúng tôi kiểm tra và xử lý đổi trả trong 3-5 ngày',
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chính sách đổi trả</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Chính sách đổi trả
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Strength's Best cam kết mang đến trải nghiệm mua sắm tốt nhất. Chúng tôi có chính sách đổi trả linh hoạt để đảm bảo quyền lợi của khách hàng.
          </Text>
        </View>

        {/* Return Conditions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Điều kiện đổi trả
          </Text>
          
          {returnConditions.map((condition, index) => (
            <View key={index} style={[styles.conditionCard, { backgroundColor: colors.card }]}>
              <View style={styles.conditionContent}>
                <Ionicons name={condition.icon as any} size={24} color={colors.accent} />
                <View style={styles.conditionInfo}>
                  <Text style={[styles.conditionTitle, { color: colors.text }]}>
                    {condition.title}
                  </Text>
                  <Text style={[styles.conditionDescription, { color: colors.textSecondary }]}>
                    {condition.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Return Reasons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Lý do đổi trả và chính sách
          </Text>
          
          {returnReasons.map((item, index) => (
            <View key={index} style={[styles.reasonCard, { backgroundColor: colors.card }]}>
              <View style={styles.reasonHeader}>
                <Ionicons name={item.icon as any} size={24} color={colors.accent} />
                <Text style={[styles.reasonText, { color: colors.text }]}>
                  {item.reason}
                </Text>
              </View>
              <View style={[styles.policyBadge, { backgroundColor: colors.accent + '20' }]}>
                <Text style={[styles.policyText, { color: colors.accent }]}>
                  {item.policy}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Return Process */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quy trình đổi trả
          </Text>
          
          {returnProcess.map((step, index) => (
            <View key={index} style={[styles.processCard, { backgroundColor: colors.card }]}>
              <View style={styles.processHeader}>
                <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.processInfo}>
                  <Text style={[styles.processTitle, { color: colors.text }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.processDescription, { color: colors.textSecondary }]}>
                    {step.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Lưu ý quan trọng
          </Text>
          <View style={styles.notesList}>
            <View style={styles.noteItem}>
              <Ionicons name="warning" size={20} color="#ff6b6b" />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Không áp dụng đổi trả cho sản phẩm đã mở niêm phong và sử dụng
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="warning" size={20} color="#ff6b6b" />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Sản phẩm khuyến mãi, giảm giá có thể có chính sách riêng
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="warning" size={20} color="#ff6b6b" />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Thời gian xử lý có thể kéo dài trong dịp lễ, Tết
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liên hệ đổi trả
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Hotline: 1900-1234
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Email: support@strengthbest.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>
                Giờ làm việc: 8:00 - 22:00 (Thứ 2 - Chủ nhật)
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
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  conditionCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  conditionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  conditionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  reasonCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  policyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  policyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  processCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  processInfo: {
    flex: 1,
  },
  processTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  processDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  notesList: {
    padding: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteText: {
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
});

export default ReturnPolicyScreen;
