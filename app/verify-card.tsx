import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { API_CONFIG } from '../constants/config';

const VerifyCardScreen: React.FC = () => {
  const router = useRouter();
  const { cardId, maskedCardNumber, verificationCode } = useLocalSearchParams();
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Tự động điền mã nếu có
    if (verificationCode && typeof verificationCode === 'string') {
      const codeArray = verificationCode.split('').slice(0, 7);
      setCode([...codeArray, ...Array(7 - codeArray.length).fill('')]);
    }

    // Bắt đầu countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationCode]);

  const handleCodeChange = (text: string, index: number) => {
    // Chỉ cho phép chữ và số
    const filteredText = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    const newCode = [...code];
    newCode[index] = filteredText.slice(-1); // Chỉ lấy ký tự cuối
    setCode(newCode);

    // Auto focus next input
    if (filteredText && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!filteredText && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 7) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã xác minh 7 ký tự');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardId,
          verificationCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mã xác minh không đúng');
      }

      Alert.alert(
        'Thành công!',
        'Thẻ của bạn đã được xác minh và lưu thành công.',
        [
          {
            text: 'Quay lại checkout',
            onPress: () => router.replace('/checkout')
          },
          {
            text: 'Xem thẻ của tôi',
            onPress: () => router.replace('/my-cards')
          }
        ]
      );

    } catch (error: any) {
      console.error('Error verifying card:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xác minh thẻ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api/v1', '/api')}/cards/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể gửi lại mã');
      }

      Alert.alert('Thành công', 'Mã xác minh mới đã được gửi đến email của bạn');
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);

    } catch (error: any) {
      console.error('Error resending code:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/my-cards')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Xác minh thẻ</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
          <Ionicons name="card" size={40} color="#fff" />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Xác minh thẻ tín dụng
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Chúng tôi đã gửi mã xác minh 7 ký tự đến email của bạn để xác nhận thẻ{'\n'}
          <Text style={{ fontWeight: 'bold', color: colors.text }}>
            {maskedCardNumber}
          </Text>
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              style={[
                styles.codeInput,
                { 
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  color: colors.text
                },
                digit && { borderColor: colors.accent }
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              maxLength={1}
              autoCapitalize="characters"
              autoFocus={index === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Button */}
        <TouchableOpacity
          style={[
            styles.resendButton,
            (!canResend || resendLoading) && styles.resendButtonDisabled
          ]}
          onPress={handleResendCode}
          disabled={!canResend || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Text style={[styles.resendText, { color: colors.textSecondary }]}>
              {canResend ? 'Gửi lại mã' : `Gửi lại sau ${countdown}s`}
            </Text>
          )}
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { backgroundColor: colors.accent },
            loading && styles.verifyButtonDisabled
          ]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Xác minh</Text>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={[styles.helpText, { color: colors.textSecondary }]}>
          Không nhận được mã? Kiểm tra thư mục spam hoặc{'\n'}
          liên hệ hỗ trợ khách hàng
        </Text>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 16,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VerifyCardScreen;