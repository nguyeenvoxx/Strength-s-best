import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useAuthStore } from '../store/useAuthStore';
import { changePassword } from '../services/authApi';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = useAuthStore((state) => state.token);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Thông báo', 'Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Thông báo', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    // Kiểm tra thêm nếu muốn: phải có chữ và số, khác mật khẩu cũ, v.v.

    try {
      if (!token) {
        Alert.alert('Thông báo', 'Không tìm thấy token xác thực');
        return;
      }
      await changePassword(token, currentPassword, newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được đổi thành công', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const handleCancel = () => {
    router.replace('/profile');
  };

  // Kiểm tra authentication
  if (!token) {
    return (
      <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.replace('/profile')}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text }]}>Đổi mật khẩu</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Authentication Required */}
        <View style={[styles.authRequiredContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.authRequiredIcon, { color: colors.textSecondary }]}>🔒</Text>
          <Text style={[styles.authRequiredTitle, { color: colors.text }]}>Yêu cầu đăng nhập</Text>
          <Text style={[styles.authRequiredMessage, { color: colors.textSecondary }]}>
            Vui lòng đăng nhập để đổi mật khẩu
          </Text>
          <TouchableOpacity
            style={[styles.authRequiredButton, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={[styles.authRequiredButtonText, { color: '#fff' }]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.replace('/profile')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Đổi mật khẩu</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Current Password */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Mật khẩu hiện tại</Text>
          <View style={[styles.passwordContainer, { borderBottomColor: colors.border }] }>
            <TextInput 
              style={[styles.passwordInput, { color: colors.text }]} 
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons 
                name={showCurrentPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Mật khẩu mới</Text>
          <View style={[styles.passwordContainer, { borderBottomColor: colors.border }] }>
            <TextInput 
              style={[styles.passwordInput, { color: colors.text }]} 
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons 
                name={showNewPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Xác nhận mật khẩu mới</Text>
          <View style={[styles.passwordContainer, { borderBottomColor: colors.border }] }>
            <TextInput 
              style={[styles.passwordInput, { color: colors.text }]} 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Password Requirements */}
        <View style={[styles.requirementsContainer, { backgroundColor: colors.card }] }>
          <Text style={[styles.requirementsTitle, { color: colors.text }]}>Yêu cầu mật khẩu:</Text>
          <Text style={[styles.requirement, { color: colors.textSecondary }]}>• Ít nhất 6 ký tự</Text>
          <Text style={[styles.requirement, { color: colors.textSecondary }]}>• Bao gồm chữ và số</Text>
          <Text style={[styles.requirement, { color: colors.textSecondary }]}>• Khác với mật khẩu hiện tại</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.accent, borderColor: colors.border }]} onPress={handleCancel}>
          <Text style={[styles.cancelButtonText, { color: '#fff' }]}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: isDark ? colors.text : '#404040' }]} onPress={handleChangePassword}>
          <Text style={[styles.saveButtonText, { color: isDark ? colors.background : '#fff' }]}>Đổi mật khẩu</Text>
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
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 8,
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 100, // Tránh bị che bởi bottom tabs
    gap: 12,
  },
  cancelButton: {
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
  // Authentication required styles
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  authRequiredIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  authRequiredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  authRequiredMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  authRequiredButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  authRequiredButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ChangePasswordScreen;
