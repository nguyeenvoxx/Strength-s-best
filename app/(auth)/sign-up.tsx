import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getPlatformContainerStyle } from '../../utils/platformUtils';

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [address, setAddress] = useState('');
  
  const { signup, isLoading, error, clearError } = useAuthStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Chấp nhận tất cả các đầu số phổ biến ở Việt Nam
    // 03, 05, 07, 08, 09 (các nhà mạng chính)
    const phoneRegex = /^(\+84\s?[35789]\d{8}|0[35789]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (phone: string) => {
    // Chuẩn hóa số điện thoại về format +84 9xxxxxxxx
    let formatted = phone.replace(/\s/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+84' + formatted.slice(1);
    } else if (!formatted.startsWith('+84')) {
      formatted = '+84' + formatted;
    }
    // Thêm khoảng trắng sau +84
    if (formatted.startsWith('+84') && !formatted.startsWith('+84 ')) {
      formatted = '+84 ' + formatted.slice(3);
    }
    return formatted;
  };

  const handleSignUp = async (data: any) => {
    // Clear previous errors
    clearError();

    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường');
      return;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: user@example.com)');
      return;
    }
    
    // Validate name (should not be just numbers)
    if (fullName.trim().length < 2) {
      Alert.alert('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    
    if (!agree) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với điều khoản và chính sách');
      return;
    }

    if (!phone) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!address) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    const formattedPhone = formatPhone(phone);
    if (!validatePhone(formattedPhone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng');
      return;
    }

    try {
      console.log('🔍 Đang đăng ký với dữ liệu:', { 
        name: data.name, 
        email: data.email, 
        phone: data.phone,
        address: data.address
      });

      await signup(data);
      
      console.log('✅ Đăng ký thành công, chuyển đến email verification');
      
      // Sau khi đăng ký thành công, chuyển đến trang xác thực email
      router.replace({ 
        pathname: './email-verification', 
        params: { email: data.email } 
      });
    } catch (error: any) {
      console.error('❌ Lỗi đăng ký:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đăng ký';
      Alert.alert('Đăng ký thất bại', errorMessage);
    }
  };

  // Thay vì gọi handleSignUp trực tiếp, tạo hàm mới để truyền phone đã chuẩn hóa
  const handleSignUpWithPhone = (phoneToSave: string) => {
    handleSignUp({ 
      name: fullName.trim(), 
      email: email.trim().toLowerCase(), 
      password,
      phoneNumber: phoneToSave,
      addressDetails: {
        fullName: fullName.trim(),
        phone: phoneToSave,
        address: address.trim(),
        province: '',
        district: '',
        ward: ''
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, getPlatformContainerStyle()]}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Số điện thoại (03, 05, 07, 08, 09xxxxxxxx)"
          value={phone}
          onChangeText={text => {
            // Cho phép nhập số và dấu +
            let formatted = text.replace(/[^0-9+]/g, '');
            
            // Nếu bắt đầu bằng 0, kiểm tra đầu số hợp lệ (03, 05, 07, 08, 09)
            if (formatted.startsWith('0')) {
              const secondDigit = formatted.charAt(1);
              if (['3', '5', '7', '8', '9'].includes(secondDigit)) {
                if (formatted.length > 10) formatted = formatted.slice(0, 10);
              } else {
                // Nếu đầu số không hợp lệ, chỉ giữ lại số 0
                formatted = '0';
              }
            } 
            // Nếu bắt đầu bằng +84, kiểm tra đầu số hợp lệ
            else if (formatted.startsWith('+84')) {
              const fifthDigit = formatted.charAt(4);
              if (['3', '5', '7', '8', '9'].includes(fifthDigit)) {
                if (formatted.length > 13) formatted = formatted.slice(0, 13);
              } else {
                // Nếu đầu số không hợp lệ, chỉ giữ lại +84
                formatted = '+84';
              }
            }
            // Nếu không có prefix, thêm 0
            else if (formatted.length > 0 && !formatted.startsWith('0') && !formatted.startsWith('+')) {
              formatted = '0' + formatted;
              if (formatted.length > 10) formatted = formatted.slice(0, 10);
            }
            
            setPhone(formatted);
            setPhoneError('');
          }}
          keyboardType="phone-pad"
          maxLength={13}
        />
        {phoneError ? <Text style={{color: 'red', marginBottom: 8}}>{phoneError}</Text> : null}
      </View>

      {/* Thông tin địa chỉ */}
      <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập địa chỉ giao hàng của bạn"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="words"
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.options}>
        <TouchableOpacity onPress={() => setAgree(!agree)}>
          <View style={styles.checkbox}>
            {agree && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.optionText}>Tôi đồng ý với chính sách bảo mật và quyền riêng tư</Text>
      </View>
      <TouchableOpacity 
        style={[styles.signUpButton, isLoading && styles.buttonDisabled]} 
        onPress={() => {
          // Chuẩn hóa số điện thoại trước khi đăng ký
          let phoneToSave = phone.trim();
          if (phoneToSave.startsWith('0') && phoneToSave.length === 10) {
            phoneToSave = '+84' + phoneToSave.slice(1);
          } else if (!phoneToSave.startsWith('+84')) {
            phoneToSave = '+84' + phoneToSave;
          }
          // Thêm khoảng trắng sau +84
          if (phoneToSave.startsWith('+84') && !phoneToSave.startsWith('+84 ')) {
            phoneToSave = '+84 ' + phoneToSave.slice(3);
          }
          handleSignUpWithPhone(phoneToSave);
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('./sign-in')}>
          <Text style={styles.footerLink}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Thêm padding bottom để tránh bị che bởi bottom tabs
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    width: '100%',
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
  },
  optionText: {
    marginLeft: 10,
    color: '#666',
  },
  signUpButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
    width: 316,
    height: 54
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  footer: {
    flexDirection: 'row',
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
