import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { updateProfile } from '../services/authApi';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  // Hàm format số điện thoại về dạng +84 123456789
  function formatPhone(raw: string | undefined): string {
    if (!raw) return '';
    if (/^\+84\s\d{9}$/.test(raw)) return raw; // Đúng định dạng
    if (/^0\d{9}$/.test(raw)) return '+84 ' + raw.slice(1); // 0xxxxxxxxx => +84 xxxxxxxxx
    if (/^\+84\d{9}$/.test(raw)) return '+84 ' + raw.slice(3); // +849xxxxxxxx => +84 9xxxxxxxx
    return raw;
  }
  const [phone, setPhone] = useState(user?.phone || (user as any)?.phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');
  // Thêm dòng này để fix lỗi avatarUrl chưa khai báo
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  // Xóa trường address vì API không hỗ trợ
  // const [address, setAddress] = useState(user?.address || '');
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  // Khi mở màn hình, lấy địa chỉ đầu tiên từ AsyncStorage nếu có
  React.useEffect(() => {
    setAddress(user?.address || '');
  }, [user?.address]);

  const handleSave = async () => {
    // Tự động thêm +84 nếu cần khi lưu
    let phoneToSave = phone.trim();
    if (phoneToSave.startsWith('0') && phoneToSave.length === 10) {
      phoneToSave = '+84' + phoneToSave.slice(1);
    } else if (!phoneToSave.startsWith('+84')) {
      // Nếu không có +84 và không bắt đầu bằng 0, giữ nguyên
    }
    if (!user || !user._id || !token) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }
    try {
      // Không truyền address vào updateProfile vì API không nhận
      const res = await updateProfile(token, { name, email, phoneNumber: phoneToSave, address });
      setUser(res.data.user);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật', [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]);
    } catch (err: any) {
      console.log('Update profile error:', err?.response?.data || err?.message || err);
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể cập nhật thông tin');
    }
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
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Chỉnh sửa hồ sơ</Text>
        <View style={styles.placeholder} />
      </View>
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
        <Text style={[styles.label, { color: colors.text }]}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại của bạn"
          keyboardType="phone-pad"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.text }]}>Địa chỉ</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ của bạn"
          placeholderTextColor={colors.textSecondary}
        />
        {phoneError ? <Text style={{ color: 'red', marginBottom: 8 }}>{phoneError}</Text> : null}

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
    fontWeight: 'bold',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
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
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    marginBottom: 24,
    fontSize: 16,
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
  },
  arrow: {
    fontSize: 18,
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
