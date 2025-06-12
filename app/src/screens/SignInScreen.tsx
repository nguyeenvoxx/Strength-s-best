import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  SignUp: undefined;
  ForgotPassword: undefined;
  Welcome: undefined;
  Home: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SignInScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false)

  const handleSignIn = () => {
    if (!email) {
      setEmailError(true);
      Alert.alert('Error', 'Email does not exist');
      return;
    }
    setEmailError(false);
    
    if (!password) { 
      setPassError(true);
      Alert.alert('Error', 'Wrong Password');
      return;
    } else {
      setPassError(false);
    }
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Gắn logo lá xanh vào đây */}
      <Image source={require('../images/logo.png')} style={styles.logo} />

      <View style={[styles.inputWrapper, emailError && styles.inputError]}>
        <Image source={require('../images/user.png')} style={styles.icon} />
        <TextInput
          placeholder="Username"
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          keyboardType="email-address"
        />
      </View>

      {emailError && <Text style={styles.errorText}>Email does not exist</Text>}
      <View style={[styles.inputWrapper, passError && styles.inputError]}>
        <Image source={require('../images/lock.png')} style={styles.icon} />
        <TextInput
          // style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.textInput}
        />
      </View>
      {passError && <Text style={styles.errorText}>Sai mật khẩu</Text>}
      <View style={styles.options}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
          <View style={styles.checkbox}>
            {rememberMe && <View style={styles.checkboxInner} />}
          </View>
        </TouchableOpacity>
        <Text style={styles.optionText}>Remember me</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Quên mật khẩu</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
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
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.footerLink}>Sign up</Text>
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputError: {
    borderColor: 'red',
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
    color: '#000',
    fontWeight: 'bold',
  },
});

export default SignInScreen;