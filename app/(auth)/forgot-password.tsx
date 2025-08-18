import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { requestResetPassword } from '../../services/authApi';
import { Ionicons } from '@expo/vector-icons';

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();
  const [Email, setEmail] = useState('')

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    if (!Email) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email của bạn')
    } else {
      if (!validateEmail(Email)) {
        Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: user@example.com)');
        return;
      }
      try {
        // Gửi yêu cầu backend gửi mã OTP đổi mật khẩu về email
        await requestResetPassword(Email.trim().toLowerCase());
        Alert.alert('Đã gửi mã', 'Mã xác thực đổi mật khẩu đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.', [
          { text: 'OK', onPress: () => router.replace({ pathname: './reset-password', params: { email: Email.trim().toLowerCase() } }) }
        ]);
      } catch (error: any) {
        Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi mã đổi mật khẩu. Vui lòng thử lại.');
      }
    }
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      <Text style={styles.subtitle}>
        Nhập địa chỉ email của bạn
      </Text>
      <View style={styles.inputContainer}>
        <Image source={require('../../assets/images/mail.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Nhập địa chỉ email của bạn"
          keyboardType="email-address"
          value={Email}
          onChangeText={setEmail}
        />
      </View>
      <Text style={styles.note}>
        Chúng tôi sẽ gửi cho bạn một tin nhắn để thiết lập hoặc đặt lại mật khẩu mới của bạn.
      </Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleSend}>
        <Text style={styles.buttonText}>Gửi</Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#F3F3F3',
  },
  inputIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
  textInput: {
    fontSize: 16,
    color: '#676767',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: 317,
    height: 56,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
