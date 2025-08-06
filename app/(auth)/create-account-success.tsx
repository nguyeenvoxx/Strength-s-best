import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CreateAccountSuccessScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="checkmark-circle" size={100} color="#28a745" />
        
        <Text style={styles.title}>Tài khoản đã được tạo!</Text>
        <Text style={styles.subtitle}>
          Chúc mừng! Tài khoản của bạn đã được tạo thành công. Bạn có thể bắt đầu sử dụng ứng dụng ngay bây giờ.
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('../products')}
        >
          <Text style={styles.buttonText}>Bắt đầu sử dụng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    backgroundColor: '#28a745',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateAccountSuccessScreen;
