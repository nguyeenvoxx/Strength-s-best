import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  ForgotPassword: undefined;
  SignUp: undefined;
  CreateAccountSuccess: undefined
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng Quay lại!</Text>
      <View style={styles.inputContainer}>
        <Image source={require('../images/UserActor.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Email"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../images/keylock.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Nhập mật khẩu"
          secureTextEntry
        />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signInButton}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>- Hoặc tiếp tục với -</Text>
      <View style={styles.socialButtons}>

        {/* icon Google, Apple, Facebook*/}
        <TouchableOpacity>
          <Image source={require('../images/google-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../images/apple-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../images/facebook-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Tạo tài khoản </Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAccountSuccess')}>
          <Text style={styles.footerLink}>Đăng ký</Text>
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
  title: {
    fontSize: 43,
    fontWeight: 'bold',
    marginBottom: 20,
    marginRight: 63,
    fontFamily: 'Montserrat'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#A8A8A9',
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  // input: {
  //   width: '100%',
  //   // borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 5,
  //   padding: 10,
  //   marginBottom: 10,
  //   flex:1
  // },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#676767',
  },
  forgotText: {
    color: '#F83758',
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginBottom: 20,
    width: 317,
    height: 55
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "center"
  },
  orText: {
    color: '#666',
    marginBottom: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 20,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  footer: {
    flexDirection: 'row',
  },
  footerText: {
    color: '#666',
  },
  footerLink: {
    color: '#ff4d4f',
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;