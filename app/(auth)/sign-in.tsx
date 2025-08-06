import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { getPlatformContainerStyle } from '../../utils/platformUtils';

const SignInScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const handleSignIn = async () => {
    // Clear previous errors
    setEmailError(false);
    setPassError(false);
    clearError();

    // Validate inputs
    if (!email) {
      setEmailError(true);
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email');
      return;
    }

    if (!password) {
      setPassError(true);
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace('../products');
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />

      <View style={[styles.inputWrapper, emailError && styles.inputError]}>
        <Image source={require('../../assets/images/user.png')} style={styles.icon} />
        <TextInput
          placeholder="Tên tài khoản"
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          keyboardType="email-address"
        />
      </View>

      {emailError && <Text style={styles.errorText}>Email không tồn tại</Text>}
      <View style={[styles.inputWrapper, passError && styles.inputError]}>
        <Image source={require('../../assets/images/lock.png')} style={styles.icon} />
        <TextInput
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.textInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      {passError && <Text style={styles.errorText}>Sai mật khẩu</Text>}
      
      <View style={styles.options}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
          <View style={styles.checkbox}>
            {rememberMe && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.optionText}>Bạn có nhớ</Text>
        <TouchableOpacity onPress={() => router.push('./forgot-password')}>
          <Text style={styles.forgotText}>Quên mật khẩu</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.signInButton, isLoading && styles.buttonDisabled]} 
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../../assets/images/google-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../../assets/images/facebook-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
      </View>      
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('./sign-up')}>
          <Text style={styles.signUpLink}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={() => router.push('../products')}>
        <Text style={styles.guestText}>Bạn sẽ tiếp tục là khách</Text>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
    height: 48,
  },
  inputError: {
    borderColor: 'red',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#555',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    marginLeft: 10,
    color: '#666',
  },
  forgotText: {
    color: '#666',
  },
  signInButton: {
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
    textAlign: "center"
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },  socialIcon: {
    width: 40,
    height: 40,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  signUpText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    color: '#000',
    fontWeight: 'bold',
  },
  guestText: {
    color: '#469B43',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});

export default SignInScreen;
