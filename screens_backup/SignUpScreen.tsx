import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  SignIn: undefined;
  EmailVerification: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShoPassword] = useState(false)

  const handleSignUp = () => {
    if (!agree || !fullName || !email || !password || password !== confirmPassword) {
      alert('Vui lòng điền đầy đủ các trường và đồng ý với chính sách');
      return;
    }
    navigation.navigate('EmailVerification');
  };

  return (
    <View style={styles.container}>
      {/*  logo lá xanh */}
      <Image source={require('../images/logo.png')} style={styles.logo} />
      <View style={styles.inputWrapper}>
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShoPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShoPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.options}>
        <TouchableOpacity onPress={() => setAgree(!agree)}>
          <View style={styles.checkbox}>
            {agree && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.optionText}>Tôi đồng ý với chính sách bảo mật và quyền riêng tư</Text>
      </View>
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.footerLink}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
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
  // input: {
  //   width: '100%',
  //   // borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 5,
  //   padding: 10,
  //   marginBottom: 10,
  // },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
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