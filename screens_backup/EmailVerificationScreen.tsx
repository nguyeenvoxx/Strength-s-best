import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  CreateAccountSuccess: undefined;
  SignUp: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const EmailVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [code, setCode] = useState(['', '', '', '']);


  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
  };


  const handleConfirm = () => {
    if (code.every((digit) => digit !== '')) {
      navigation.navigate('CreateAccountSuccess');
    } else {
      alert('Vui lòng nhập mã đầy đủ');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác thực email</Text>
      <Text style={styles.subtitle}>
        Vui lòng nhập mã otp 4 đầu được gửi đến user@gmail.com
      </Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            keyboardType="numeric"
            maxLength={1}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendText}>Gửi lại sau 60s Gửi lại</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Xác nhận</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.confirmButton1} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.backText}>Quay lại</Text>
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
    textAlign: 'center',
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 20,
  },
  resendButton: {
    marginBottom: 20,
  },
  resendText: {
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    width: '50%',
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmButton1: {
    backgroundColor: '#31313140',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    width: '50%',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backText: {
    color: '#000000',
    fontSize: 18,

  },
});

export default EmailVerificationScreen;