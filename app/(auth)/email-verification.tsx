import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import { useAuthStore } from '../../store/useAuthStore';

const EmailVerificationScreen: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { verifyEmail, resendVerificationCode } = useAuthStore();

  useEffect(() => {
    // Bắt đầu countdown khi component mount
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
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ 4 chữ số');
      return;
    }

    if (!email) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin email');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Đang xác thực email:', { email, verificationCode });

      await verifyEmail(email as string, verificationCode);
      
      console.log('✅ Xác thực email thành công');
      Alert.alert(
        'Thành công', 
        'Xác thực email thành công! Tài khoản của bạn đã được kích hoạt.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('./create-account-success')
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Lỗi xác thực email:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xác thực';
      Alert.alert('Xác thực thất bại', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin email');
      return;
    }

    try {
      setResendLoading(true);
      console.log('🔍 Đang gửi lại mã xác thực cho:', email);

      await resendVerificationCode(email as string);
      
      console.log('✅ Gửi lại mã xác thực thành công');
      Alert.alert('Thành công', 'Mã xác thực mới đã được gửi đến email của bạn');
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      console.error('❌ Lỗi gửi lại mã:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gửi lại mã';
      Alert.alert('Gửi lại thất bại', errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <Text style={styles.title}>Xác thực email</Text>
      <Text style={styles.subtitle}>
         Vui lòng nhập mã OTP 4 chữ số được gửi đến {typeof email === 'string' ? email.replace(/\s+/g,'') : 'email của bạn'}
      </Text>
      
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => { inputRefs.current[index] = ref; }}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
            autoFocus={index === 0}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.resendButton, (!canResend || resendLoading) && styles.resendButtonDisabled]} 
        onPress={handleResendCode}
        disabled={!canResend || resendLoading}
      >
        {resendLoading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Text style={styles.resendText}>
            {canResend ? 'Gửi lại mã' : `Gửi lại sau ${countdown}s`}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.confirmButton, isLoading && styles.buttonDisabled]} 
        onPress={handleVerifyCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('./sign-up')}
      >
        <Text style={styles.backText}>Quay lại đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 30,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  resendButton: {
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#666',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '60%',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '60%',
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  backText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;
