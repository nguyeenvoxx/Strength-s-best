import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../../utils/platformUtils';
import { verifyResetPassword } from '../../services/authApi';

const ResetPasswordScreen: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    const onlyDigits = text.replace(/\D/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[index] = onlyDigits;
    setCode(newCode);

    if (onlyDigits && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (!onlyDigits && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const resetCode = code.join('');
    if (!email || typeof email !== 'string') {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin email');
      return;
    }
    if (resetCode.length !== 4) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ 4 chữ số mã xác thực');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsLoading(true);
      await verifyResetPassword({
        email: email.trim().toLowerCase(),
        resetCode,
        newPassword,
        confirmPassword,
      });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', [
        { text: 'OK', onPress: () => router.replace('./sign-in') }
      ]);
    } catch (error: any) {
      Alert.alert('Thất bại', error.response?.data?.message || error.message || 'Không thể đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}> 
      <Text style={styles.title}>Đổi mật khẩu bằng mã xác thực</Text>
      <Text style={styles.subtitle}>
        Nhập mã OTP 4 chữ số được gửi đến {typeof email === 'string' ? email.replace(/\s+/g, '') : 'email của bạn'} và đặt mật khẩu mới.
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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.textInput}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Nhập mật khẩu mới"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <TextInput
          style={styles.textInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu mới"
        />
      </View>

      <TouchableOpacity 
        style={[styles.confirmButton, isLoading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận đổi mật khẩu</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.replace('./sign-in')}
      >
        <Text style={styles.backText}>Quay lại đăng nhập</Text>
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
    marginBottom: 24,
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
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;


