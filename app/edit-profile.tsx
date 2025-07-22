import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { changePassword } from '../services/authApi';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const handleSave = () => {
    if (!user || !user._id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    // Tạo object user mới (giữ lại các trường cũ, chỉ đổi tên/email/avatar)
    const updatedUser = {
      ...user,
      name,
      email,
      avatarUrl: avatarUrl ?? undefined, // fix type: không truyền null
      _id: user._id, // đảm bảo _id luôn là string
    };
    setUser(updatedUser);

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

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Bạn cần cho phép truy cập thư viện ảnh!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
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
          <Image source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/avatar.png')} style={styles.avatar} />
          <TouchableOpacity style={[styles.cameraButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handlePickAvatar}>
            <Image source={require('../assets/images/camera.png')} style={styles.cameraImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Tên người dùng</Text>
        <TextInput 
          style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]} 
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên của bạn" 
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput 
          style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]} 
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập email của bạn"
          keyboardType="email-address"
          placeholderTextColor={colors.textSecondary}
        />

        {/* Change Password */}
        <TouchableOpacity style={[styles.passwordRow, { borderBottomColor: colors.border }]} onPress={handleChangePassword}>
          <Text style={[styles.passwordLabel, { color: colors.text }]}>Đổi mật khẩu</Text>
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.accent, borderColor: colors.border }]} onPress={handleCancel}>
          <Text style={[styles.cancelButtonText, { color: '#fff' }]}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: isDark ? colors.text : '#404040' }]} onPress={handleSave}>
          <Text style={[styles.saveButtonText, { color: isDark ? colors.background : '#fff' }]}>Lưu</Text>
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
