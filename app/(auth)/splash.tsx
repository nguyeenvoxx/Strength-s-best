import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useSettingStore } from '../../store/useSettingStore';

const SplashScreen: React.FC = () => {
  const { setIsFirstTime } = useSettingStore();
  
  const handleGetStarted = () => {
    // Đánh dấu không còn là lần đầu tiên
    setIsFirstTime(false);
    router.replace('/home');
  };

  const handleSignIn = () => {
    // Đánh dấu không còn là lần đầu tiên
    setIsFirstTime(false);
    router.replace('./sign-in');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Strength's Best</Text>
      <Text style={styles.subtitle}>Sức khỏe là hạnh phúc. Hãy trân trọng và chăm sóc bản thân!</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Bắt đầu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
        >
          <Text style={styles.signInButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity onPress={handleSignIn}>
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
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#469B43',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#469B43',
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#469B43',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestText: {
    color: '#469B43',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});

export default SplashScreen;
