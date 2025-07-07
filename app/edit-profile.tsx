import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';

const EditProfileScreen: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('VuDuyPhuc');
  const [email, setEmail] = useState('vuduyphuc674@gmail.com');

  const handleSave = () => {
    // Implement save logic here
    Alert.alert('Thành công', 'Thông tin đã được cập nhật', [
      {
        text: 'OK',
        onPress: () => router.back()
      }
    ]);
  };

  const handleCancel = () => {
    router.back();
  };
  const handleChangePassword = () => {
    router.push('./change-password');
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      {/* Header */}
      {/* <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Chỉnh sửa hồ sơ</Text>
        <View style={styles.placeholder} />
      </View> */}

      {/* Profile Avatar */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraButton}>
            <Image source={require('../assets/images/camera.png')} style={styles.cameraImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Tên người dùng</Text>
        <TextInput 
          style={styles.input} 
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên của bạn" 
        />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập email của bạn"
          keyboardType="email-address"
        />

        {/* Change Password */}
        <TouchableOpacity style={styles.passwordRow} onPress={handleChangePassword}>
          <Text style={styles.passwordLabel}>Đổi mật khẩu</Text>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  cameraImage: {
    width: 16,
    height: 16,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 12,
    marginBottom: 24,
    fontSize: 16,
    color: '#333',
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 16,
    marginBottom: 40,
  },
  passwordLabel: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#666',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#469B43',
    padding: 16,
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#404040',
    padding: 16,
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default EditProfileScreen;
