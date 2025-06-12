import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const ForgotPasswordScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      {/* <Text style={styles.subtitle}>
        Nhập địa chỉ email của bạn
      </Text> */}
      <Text style={styles.note}>
        Chúng tôi sẽ gửi cho bạn một tin nhắn để thiết lập hoặc đặt lại mật khẩu mới của bạn.
      </Text>
      <View style={styles.inputContainer}>
        <Image source={require('../images/Mail.png')} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Nhập địa chỉ email của bạn"
          keyboardType="email-address"
        />
      </View>
      <TouchableOpacity style={styles.submitButton}>
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
  // input: {
  //   width: '100%',
  //   // borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 5,
  //   padding: 10,
  //   flex: 1,
  //   marginBottom: 20,
  // },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#676767',
  },
  submitButton: {
    backgroundColor: '#ff4d4f',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    width: 317,
    height: 55
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: "center"
  },
});

export default ForgotPasswordScreen;