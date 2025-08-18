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

const ShippingInfoScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const shippingMethods = [
    {
      name: 'Giao hàng tiêu chuẩn',
      description: 'Giao hàng trong 2-3 ngày làm việc',
      price: '30.000đ',
      icon: 'car-outline',
      features: ['Giao hàng tận nơi', 'Không giới hạn địa chỉ', 'Theo dõi đơn hàng'],
    },
    {
      name: 'Giao hàng nhanh',
      description: 'Giao hàng trong 1-2 ngày làm việc',
      price: '50.000đ',
      icon: 'flash-outline',
      features: ['Giao hàng ưu tiên', 'Không giới hạn địa chỉ', 'Theo dõi đơn hàng'],
    },
    {
      name: 'Giao hàng siêu tốc',
      description: 'Giao hàng trong ngày (nếu đặt trước 12h)',
      price: '80.000đ',
      icon: 'rocket-outline',
      features: ['Giao hàng trong ngày', 'Chỉ áp dụng Hà Nội, TP.HCM', 'Theo dõi đơn hàng'],
    },
  ];

  const deliveryAreas = [
    {
      area: 'Hà Nội',
      time: '1-2 ngày',
      fee: '30.000đ',
      icon: 'location-outline',
    },
    {
      area: 'TP.HCM',
      time: '1-2 ngày',
      fee: '30.000đ',
      icon: 'location-outline',
    },
    {
      area: 'Các tỉnh miền Bắc',
      time: '2-3 ngày',
      fee: '40.000đ',
      icon: 'location-outline',
    },
    {
      area: 'Các tỉnh miền Trung',
      time: '3-4 ngày',
      fee: '50.000đ',
      icon: 'location-outline',
    },
    {
      area: 'Các tỉnh miền Nam',
      time: '2-3 ngày',
      fee: '45.000đ',
      icon: 'location-outline',
    },
  ];

  const deliveryProcess = [
    {
      step: '1',
      title: 'Xác nhận đơn hàng',
      description: 'Chúng tôi xác nhận đơn hàng trong vòng 2 giờ',
      icon: 'checkmark-circle-outline',
    },
    {
      step: '2',
      title: 'Chuẩn bị hàng',
      description: 'Đóng gói và chuẩn bị hàng để giao',
      icon: 'cube-outline',
    },
    {
      step: '3',
      title: 'Giao hàng',
      description: 'Đối tác vận chuyển nhận hàng và giao đến bạn',
      icon: 'car-outline',
    },
    {
      step: '4',
      title: 'Nhận hàng',
      description: 'Kiểm tra và ký nhận hàng',
      icon: 'hand-left-outline',
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thông tin vận chuyển</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin vận chuyển
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Strength's Best cung cấp nhiều lựa chọn vận chuyển linh hoạt để đáp ứng nhu cầu của bạn. Chúng tôi cam kết giao hàng nhanh chóng và an toàn.
          </Text>
        </View>

        {/* Shipping Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Phương thức vận chuyển
          </Text>
          
          {shippingMethods.map((method, index) => (
            <View key={index} style={[styles.methodCard, { backgroundColor: colors.card }]}>
              <View style={styles.methodHeader}>
                <Ionicons name={method.icon as any} size={24} color={colors.accent} />
                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, { color: colors.text }]}>
                    {method.name}
                  </Text>
                  <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                    {method.description}
                  </Text>
                </View>
                <View style={[styles.priceBadge, { backgroundColor: colors.accent + '20' }]}>
                  <Text style={[styles.priceText, { color: colors.accent }]}>
                    {method.price}
                  </Text>
                </View>
              </View>
              <View style={styles.featuresList}>
                {method.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={16} color={colors.accent} />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Areas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Khu vực giao hàng
          </Text>
          
          {deliveryAreas.map((area, index) => (
            <View key={index} style={[styles.areaCard, { backgroundColor: colors.card }]}>
              <View style={styles.areaContent}>
                <Ionicons name={area.icon as any} size={24} color={colors.accent} />
                <View style={styles.areaInfo}>
                  <Text style={[styles.areaName, { color: colors.text }]}>
                    {area.area}
                  </Text>
                  <View style={styles.areaDetails}>
                    <Text style={[styles.areaDetail, { color: colors.textSecondary }]}>
                      Thời gian: {area.time}
                    </Text>
                    <Text style={[styles.areaDetail, { color: colors.textSecondary }]}>
                      Phí: {area.fee}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Process */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quy trình giao hàng
          </Text>
          
          {deliveryProcess.map((step, index) => (
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
                <Ionicons name={step.icon as any} size={24} color={colors.accent} />
              </View>
            </View>
          ))}
        </View>

        {/* Free Shipping */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Miễn phí vận chuyển
          </Text>
          <View style={styles.freeShippingInfo}>
            <Ionicons name="gift-outline" size={24} color={colors.accent} />
            <Text style={[styles.freeShippingText, { color: colors.textSecondary }]}>
              Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên
            </Text>
          </View>
        </View>

        {/* Important Notes */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Lưu ý quan trọng
          </Text>
          <View style={styles.notesList}>
            <View style={styles.noteItem}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Thời gian giao hàng có thể thay đổi trong dịp lễ, Tết
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Vui lòng cung cấp số điện thoại chính xác để liên lạc
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Kiểm tra hàng trước khi ký nhận
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Ionicons name="information-circle" size={20} color={colors.accent} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                Từ chối nhận hàng nếu sản phẩm bị hư hỏng
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liên hệ vận chuyển
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
                Email: shipping@strengthbest.com
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
  methodCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresList: {
    marginLeft: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  areaCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  areaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaInfo: {
    flex: 1,
    marginLeft: 16,
  },
  areaName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  areaDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  areaDetail: {
    fontSize: 14,
    lineHeight: 20,
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
  freeShippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  freeShippingText: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 12,
    flex: 1,
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

export default ShippingInfoScreen;
