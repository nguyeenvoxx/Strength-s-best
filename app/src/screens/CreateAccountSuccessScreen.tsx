import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  SignIn: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CreateAccountSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo một tài khoản</Text>
      <View style={styles.inputContainer}>
        <Image source={require('../images/UserActor.png')} style={styles.inputIcon} />
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Tên người dùng hoặc Email"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../images/keylock.png')} style={styles.inputIcon} />
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Mật khẩu"
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../images/keylock.png')} style={styles.inputIcon} />
        <TextInput
          // style={styles.input}
          style={styles.textInput}
          placeholder="Nhập lại mật khẩu"
          secureTextEntry
        />
      </View>
      <Text style={styles.note}>
        Bằng cách nhấp vào Đăng ký, bạn đồng ý với điều khoản của chúng tôi
      </Text>
      <TouchableOpacity
        style={styles.signUpButton}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.buttonText}>Tạo tài khoản</Text>
      </TouchableOpacity>
      <View style={styles.socialButtons}>
        {/* Gắn icon Google, Apple, Facebook vào đây */}
        {/* <TouchableOpacity>
          <Image source={require('../../assets/google-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../../assets/apple-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('../../assets/facebook-icon.png')} style={styles.socialIcon} />
        </TouchableOpacity> */}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Đã có một tài khoản? </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  }, inputContainer: {
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
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#676767',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  note: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  signUpButton: {
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

export default CreateAccountSuccessScreen;