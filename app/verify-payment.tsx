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
import { useCartStore } from '../store/useCartStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { formatPrice } from '../utils/productUtils';
import { API_CONFIG } from '../constants/config';
import { useNotificationStore } from '../store/useNotificationStore';

const VerifyPaymentScreen: React.FC = () => {
  const router = useRouter();
  const { orderId, cardId, amount, maskedCardNumber } = useLocalSearchParams();
  const { token } = useAuthStore();
  const { clearCart } = useCartStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const { create: createNotification } = useNotificationStore();

  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
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
  }, []);

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

  const handleVerifyPayment = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 7) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã xác minh 7 ký tự');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          cardId,
          verificationCode,
          amount: parseFloat(amount as string),
          method: 'card'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mã xác minh không đúng');
      }

      const result = await response.json();

      // Xóa giỏ hàng sau khi thanh toán thành công
      await clearCart(token!);

      // Sau khi xác minh thẻ thành công: đảm bảo order-detail phản ánh đã thanh toán (luồng riêng cho thẻ)
      try {
        await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}/mark-paid`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ method: 'card' })
        });
      } catch (e) {
        // Nếu backend chưa có endpoint này, bỏ qua không chặn luồng
      }

      // Thông báo: thanh toán thành công
      try {
        await createNotification(token!, {
          title: 'Thanh toán thành công',
          message: `Đơn hàng #${orderId} đã được thanh toán.`,
          type: 'order',
          relatedId: String(orderId),
          relatedModel: 'Order',
          icon: 'checkmark-circle'
        });
      } catch (e) {}

      // Hiển thị thành công và chuyển đến trang success
      router.replace({
        pathname: '/payment-success',
        params: {
          orderId: orderId,
          paymentId: result?.data?.paymentId || '',
          method: 'card'
        }
      });

    } catch (error: any) {
      console.error('Error verifying payment:', error);
      Alert.alert('Thông báo', error.message || 'Không thể xác minh thanh toán. Vui lòng thử lại.');
      // Thông báo: thanh toán thất bại
      try {
        await createNotification(token!, {
          title: 'Thanh toán thất bại',
          message: `Đơn hàng #${orderId}: mã xác minh không hợp lệ hoặc hết hạn.`,
          type: 'order',
          relatedId: String(orderId),
          relatedModel: 'Order',
          icon: 'close'
        });
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);

      const response = await fetch(`${API_CONFIG.BASE_URL}/payments/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, cardId })
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
      Alert.alert('Thông báo', error.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Hủy thanh toán',
      'Bạn có chắc muốn hủy thanh toán? Đơn hàng sẽ không được xử lý.',
      [
        { text: 'Tiếp tục thanh toán', style: 'cancel' },
        {
          text: 'Hủy thanh toán',
          style: 'destructive',
          onPress: () => {
            // TODO: Gọi API hủy đơn hàng
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/checkout')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Xác minh thanh toán</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Payment Info */}
        <View style={[styles.paymentInfo, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
            <Ionicons name="card" size={32} color="#fff" />
          </View>
          
          <Text style={[styles.amountText, { color: colors.text }]}>
            {formatPrice(parseFloat(amount as string))}
          </Text>
          
          <Text style={[styles.cardText, { color: colors.textSecondary }]}>
            Thanh toán bằng thẻ {maskedCardNumber}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          Nhập mã xác minh
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Chúng tôi đã gửi mã xác minh 7 ký tự đến email của bạn để xác nhận thanh toán
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
          onPress={handleVerifyPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Xác minh và thanh toán</Text>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={[styles.securityNote, { backgroundColor: colors.card }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.accent} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Giao dịch của bạn được bảo mật với mã hóa 256-bit SSL
          </Text>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  paymentInfo: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
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
    alignItems: 'center',
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  securityText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

export default VerifyPaymentScreen;