import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Image } from 'react-native';
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
      <TextInput
        style={styles.input}
        placeholder="Tên người dùng hoặc Email"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        secureTextEntry
      />
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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