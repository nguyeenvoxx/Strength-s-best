import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { API_CONFIG } from '../constants/config';

const AddCardScreen: React.FC = () => {
  const router = useRouter();
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    cardType: ''
  });
  const [loading, setLoading] = useState(false);

  // Xác định loại thẻ dựa trên số thẻ (đơn giản theo prefix)
  const detectCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  };

  // Kiểm tra Luhn (hợp lệ số thẻ)
  const luhnCheck = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (Number.isNaN(digit)) return false;
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Format số thẻ với khoảng trắng
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19); // Giới hạn 16 số + 3 khoảng trắng
  };

  // Format ngày hết hạn MM/YY
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      const cardType = detectCardType(formattedValue);
      setCardData(prev => ({ ...prev, cardType }));
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (field === 'cardHolder') {
      formattedValue = value.toUpperCase();
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCard = () => {
    const rawNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!cardData.cardNumber || rawNumber.length < 13) {
      Alert.alert('Thông báo', 'Vui lòng nhập số thẻ hợp lệ (13-19 chữ số)');
      return false;
    }

    // Kiểm tra loại thẻ nhận diện được
    if (!['visa', 'mastercard', 'amex'].includes(cardData.cardType)) {
      Alert.alert('Thông báo', 'Thông tin thẻ không hợp lệ hoặc không nhận diện được loại thẻ. Không thể xác minh. Vui lòng nhập đúng thông tin thẻ.');
      return false;
    }

    // Kiểm tra Luhn cho số thẻ
    if (!luhnCheck(rawNumber)) {
      Alert.alert('Thông báo', 'Số thẻ không hợp lệ. Không thể xác minh. Vui lòng kiểm tra lại số thẻ.');
      return false;
    }

    if (!cardData.cardHolder || cardData.cardHolder.length < 2) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên chủ thẻ');
      return false;
    }

    if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      Alert.alert('Thông báo', 'Vui lòng nhập ngày hết hạn đúng định dạng MM/YY');
      return false;
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã CVV (3-4 chữ số)');
      return false;
    }

    // Kiểm tra ngày hết hạn
    const [month, year] = cardData.expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    if (expiry < now) {
      Alert.alert('Thông báo', 'Thẻ đã hết hạn');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateCard()) return;

    try {
      setLoading(true);

      // Gửi thông tin thẻ để xác minh
      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          cardHolder: cardData.cardHolder,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          cardType: cardData.cardType
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm thẻ');
      }

      const result = await response.json();
      // Không hiển thị mã xác minh trong app nữa
      // Chỉ chuyển sang màn hình nhập mã OTP
      router.push({
        pathname: '/verify-card',
        params: {
          cardId: result.cardId,
          maskedCardNumber: `****-****-****-${cardData.cardNumber.slice(-4)}`
        }
      });

    } catch (error: any) {
      console.error('Error adding card:', error);
      Alert.alert('Thông báo', error.message || 'Không thể thêm thẻ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getCardIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (cardData.cardType) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'amex':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/my-cards')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Thêm thẻ mới</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Card Preview */}
        <View style={[styles.cardPreview, { backgroundColor: colors.accent }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Thẻ tín dụng</Text>
            <Ionicons name={getCardIcon()} size={32} color="#fff" />
          </View>
          
          <Text style={styles.cardNumber}>
            {cardData.cardNumber || '•••• •••• •••• ••••'}
          </Text>
          
          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>Chủ thẻ</Text>
              <Text style={styles.cardHolder}>
                {cardData.cardHolder || 'TÊN CHỦ THẺ'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>Hết hạn</Text>
              <Text style={styles.cardExpiry}>
                {cardData.expiryDate || 'MM/YY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: colors.card }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Thông tin thẻ</Text>

          {/* Số thẻ */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Số thẻ *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={cardData.cardNumber}
              onChangeText={(value) => handleInputChange('cardNumber', value)}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          {/* Tên chủ thẻ */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Tên chủ thẻ *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={cardData.cardHolder}
              onChangeText={(value) => handleInputChange('cardHolder', value)}
              placeholder="NGUYEN VAN A"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
            />
          </View>

          {/* Ngày hết hạn và CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Ngày hết hạn *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={cardData.expiryDate}
                onChangeText={(value) => handleInputChange('expiryDate', value)}
                placeholder="MM/YY"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: colors.text }]}>CVV *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background, 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={cardData.cvv}
                onChangeText={(value) => handleInputChange('cvv', value)}
                placeholder="123"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          {/* Security Note */}
          <View style={[styles.securityNote, { backgroundColor: colors.background }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
            <Text style={[styles.securityText, { color: colors.textSecondary }]}>
              Thông tin thẻ của bạn được mã hóa và bảo mật tuyệt đối
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.accent },
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Thêm thẻ</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardPreview: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  cardHolder: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardExpiry: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  form: {
    borderRadius: 12,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCardScreen;