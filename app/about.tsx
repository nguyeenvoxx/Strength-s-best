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

  const features = [
    {
      title: 'Chất lượng cao',
      description: 'Sản phẩm chính hãng, chất lượng đảm bảo',
      icon: 'checkmark-circle-outline',
    },
    {
      title: 'Giao hàng nhanh',
      description: 'Giao hàng toàn quốc trong 1-3 ngày',
      icon: 'rocket-outline',
    },
    {
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ hỗ trợ chuyên nghiệp',
      icon: 'headset-outline',
    },
    {
      title: 'Thanh toán an toàn',
      description: 'Nhiều phương thức thanh toán bảo mật',
      icon: 'shield-checkmark-outline',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Khách hàng' },
    { number: '500+', label: 'Sản phẩm' },
    { number: '50+', label: 'Thương hiệu' },
    { number: '4.8', label: 'Đánh giá' },
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Về chúng tôi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: colors.card }]}>
          <View style={[styles.logoContainer, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="leaf" size={48} color={colors.accent} />
          </View>
          <Text style={[styles.companyName, { color: colors.text }]}>
            Strength's Best
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Sức khỏe là tài sản quý giá nhất
          </Text>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thành tựu của chúng tôi
          </Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.accent }]}>
                  {stat.number}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.aboutSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Giới thiệu
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Strength's Best là thương hiệu hàng đầu trong lĩnh vực thực phẩm bổ sung và dinh dưỡng thể thao tại Việt Nam. 
            Chúng tôi cam kết mang đến những sản phẩm chất lượng cao, an toàn và hiệu quả cho sức khỏe của bạn.
          </Text>
          <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
            Với đội ngũ chuyên gia dinh dưỡng giàu kinh nghiệm, chúng tôi luôn nỗ lực nghiên cứu và phát triển 
            những sản phẩm tốt nhất, phù hợp với nhu cầu của người Việt Nam.
          </Text>
        </View>

        {/* Features Section */}
        <View style={[styles.featuresSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tại sao chọn chúng tôi
          </Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
                <Ionicons name={feature.icon as any} size={24} color={colors.accent} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mission & Vision */}
        <View style={[styles.missionSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Sứ mệnh & Tầm nhìn
          </Text>
          <View style={styles.missionItem}>
            <Text style={[styles.missionTitle, { color: colors.accent }]}>
              Sứ mệnh
            </Text>
            <Text style={[styles.missionText, { color: colors.textSecondary }]}>
              Cung cấp những sản phẩm dinh dưỡng chất lượng cao, giúp mọi người có được sức khỏe tốt nhất 
              và cuộc sống hạnh phúc hơn.
            </Text>
          </View>
          <View style={styles.missionItem}>
            <Text style={[styles.missionTitle, { color: colors.accent }]}>
              Tầm nhìn
            </Text>
            <Text style={[styles.missionText, { color: colors.textSecondary }]}>
              Trở thành thương hiệu hàng đầu về dinh dưỡng và sức khỏe tại Việt Nam, được tin tưởng 
              và lựa chọn bởi hàng triệu người dân.
            </Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={[styles.contactSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liên hệ
          </Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                123 Đường ABC, Quận 1, TP.HCM
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                1900-1234
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                info@strengthbest.com
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
  heroSection: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  statsSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  aboutSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  featuresSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  missionSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  missionItem: {
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  missionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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

export default AboutScreen; 