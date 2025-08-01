import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useSettingStore } from '../../store/useSettingStore';

const SplashScreen: React.FC = () => {
  const { setIsFirstTime } = useSettingStore();
  
  const handleGetStarted = () => {
    // Đánh dấu không còn là lần đầu tiên
    setIsFirstTime(false);
    router.push('./sign-in');
  };
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Strength's Best</Text>
      <Text style={styles.subtitle}>Sức khỏe là hạnh phúc. Hãy trân trọng và chăm sóc bản thân!</Text>
      <TouchableOpacity
        style={styles.button}
       onPress={handleGetStarted}
      >
        <Text style={styles.buttonText}>Bắt đầu</Text>
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
  button: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
