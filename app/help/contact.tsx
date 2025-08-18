import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/ThemeContext';
import { LightColors, DarkColors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const ContactScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const router = useRouter();



  const contactInfo = [
    {
      title: 'Hotline',
      value: '1900-1234',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:19001234'),
      description: 'Hỗ trợ 24/7',
    },
    {
      title: 'Email',
      value: 'support@strengthbest.com',
      icon: 'mail-outline',
      action: () => Linking.openURL('mailto:support@strengthbest.com'),
      description: 'Phản hồi trong 24h',
    },
    {
      title: 'Địa chỉ',
      value: '123 Đường ABC, Quận 1, TP.HCM',
      icon: 'location-outline',
      action: () => Linking.openURL('https://maps.google.com/?q=123+Duong+ABC+Quan+1+TPHCM'),
      description: 'Trụ sở chính',
    },
    {
      title: 'Giờ làm việc',
      value: '8:00 - 22:00',
      icon: 'time-outline',
      action: null,
      description: 'Thứ 2 - Chủ nhật',
    },
  ];

  const socialMedia = [
    {
      name: 'Facebook',
      icon: 'logo-facebook',
      url: 'https://facebook.com/strengthbest',
      color: '#1877F2',
    },
    {
      name: 'Instagram',
      icon: 'logo-instagram',
      url: 'https://instagram.com/strengthbest',
      color: '#E4405F',
    },
    {
      name: 'Zalo',
      icon: 'custom-zalo',
      url: 'https://zalo.me/19001234',
      color: '#0068FF',
    },
    {
      name: 'YouTube',
      icon: 'logo-youtube',
      url: 'https://youtube.com/strengthbest',
      color: '#FF0000',
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Liên hệ hỗ trợ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Liên hệ với chúng tôi
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
          </Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Thông tin liên hệ
          </Text>
          
          {contactInfo.map((info, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.contactCard, { backgroundColor: colors.card }]}
              onPress={info.action || undefined}
              disabled={!info.action}
            >
              <View style={styles.contactContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                  <Ionicons name={info.icon as any} size={24} color={colors.accent} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactTitle, { color: colors.text }]}>
                    {info.title}
                  </Text>
                  <Text style={[styles.contactValue, { color: colors.accent }]}>
                    {info.value}
                  </Text>
                  <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
                    {info.description}
                  </Text>
                </View>
                {info.action && (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mạng xã hội
          </Text>
          
          <View style={styles.socialGrid}>
            {socialMedia.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialCard, { backgroundColor: colors.card }]}
                onPress={() => Linking.openURL(social.url)}
              >
                 <View style={[styles.socialIcon, { backgroundColor: social.color + '20' }]}>
                   {social.icon === 'custom-zalo' ? (
                     <Image 
                       source={require('../../assets/images_sp/zalo-icon.png')}
                       style={{ width: 24, height: 24 }}
                       resizeMode="contain"
                     />
                   ) : (
                     <Ionicons name={social.icon as any} size={24} color={social.color} />
                   )}
                 </View>
                <Text style={[styles.socialName, { color: colors.text }]}>
                  {social.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* FAQ Link */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Câu hỏi thường gặp
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Bạn có thể tìm thấy câu trả lời cho nhiều câu hỏi thường gặp trong phần FAQ của chúng tôi.
          </Text>
          <TouchableOpacity
            style={[styles.faqButton, { backgroundColor: colors.accent + '20' }]}
            onPress={() => router.push('/help')}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.accent} />
            <Text style={[styles.faqButtonText, { color: colors.accent }]}>
              Xem câu hỏi thường gặp
            </Text>
          </TouchableOpacity>
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
  contactCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  contactContent: {
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
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '600',
  },

  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  faqButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ContactScreen;
