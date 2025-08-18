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

const OrderingGuideScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();

  const steps = [
    {
      number: '1',
      title: 'Tìm kiếm sản phẩm',
      description: 'Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục để tìm sản phẩm bạn muốn mua.',
      icon: 'search-outline',
    },
    {
      number: '2',
      title: 'Thêm vào giỏ hàng',
      description: 'Chọn số lượng sản phẩm và nhấn "Thêm vào giỏ hàng" để đưa sản phẩm vào giỏ.',
      icon: 'add-circle-outline',
    },
    {
      number: '3',
      title: 'Kiểm tra giỏ hàng',
      description: 'Vào giỏ hàng để xem lại các sản phẩm đã chọn và điều chỉnh số lượng nếu cần.',
      icon: 'cart-outline',
    },
    {
      number: '4',
      title: 'Chọn địa chỉ giao hàng',
      description: 'Chọn địa chỉ giao hàng có sẵn hoặc thêm địa chỉ mới.',
      icon: 'location-outline',
    },
    {
      number: '5',
      title: 'Chọn phương thức thanh toán',
      description: 'Chọn phương thức thanh toán phù hợp: thẻ tín dụng, VNPay, MoMo hoặc thanh toán khi nhận hàng.',
      icon: 'card-outline',
    },
    {
      number: '6',
      title: 'Xác nhận đơn hàng',
      description: 'Kiểm tra lại thông tin đơn hàng và nhấn "Đặt hàng" để hoàn tất.',
      icon: 'checkmark-circle-outline',
    },
  ];

  const paymentMethods = [
    {
      name: 'Thẻ tín dụng',
      description: 'Thanh toán bằng thẻ Visa, Mastercard',
      icon: 'card-outline',
    },
    {
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: 'cash-outline',
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cách đặt hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hướng dẫn đặt hàng
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Đặt hàng tại Strength's Best rất đơn giản và nhanh chóng. Chỉ cần làm theo 6 bước dưới đây:
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Các bước đặt hàng
          </Text>
          
          {steps.map((step, index) => (
            <View key={index} style={[styles.stepCard, { backgroundColor: colors.card }]}>
              <View style={styles.stepHeader}>
                <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepTitle, { color: colors.text }]}>
                    {step.title}
                  </Text>
                  <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {step.description}
                  </Text>
                </View>
                <Ionicons name={step.icon as any} size={24} color={colors.accent} />
              </View>
            </View>
          ))}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Phương thức thanh toán
          </Text>
          
          {paymentMethods.map((method, index) => (
            <View key={index} style={[styles.paymentCard, { backgroundColor: colors.card }]}>
              <View style={styles.paymentContent}>
                <Ionicons name={method.icon as any} size={24} color={colors.accent} />
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentName, { color: colors.text }]}>
                    {method.name}
                  </Text>
                  <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
                    {method.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Lưu ý quan trọng
          </Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Đảm bảo thông tin địa chỉ giao hàng chính xác
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Kiểm tra số lượng sản phẩm trước khi đặt hàng
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Lưu ý thời gian giao hàng và phí vận chuyển
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Giữ lại mã đơn hàng để theo dõi
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
  stepCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  stepHeader: {
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
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsList: {
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});

export default OrderingGuideScreen;
