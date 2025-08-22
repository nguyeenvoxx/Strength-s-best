import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { updateProfile, uploadAvatar } from '../services/authApi';
import { getUserAddresses, updateAddress } from '../services/addressApi';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  // Chuẩn hóa số điện thoại về format VN: 0XXXXXXXXX (10 số)
  function formatPhone(raw: string | undefined): string {
    if (!raw) return '';
    const p = raw.replace(/\s+/g, '');
    if (/^0\d{9}$/.test(p)) return p;
    if (/^\+84\d{9}$/.test(p)) return '0' + p.slice(3); // Chuyển +84 thành 0
    if (/^\d{9}$/.test(p)) return '0' + p; // nhập thiếu số 0 đầu
    return p;
  }
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');
  // Thêm dòng này để fix lỗi avatarUrl chưa khai báo
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  // Xóa trường address vì API không hỗ trợ
  // const [address, setAddress] = useState(user?.address || '');
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;



  const handleSave = async () => {

    let phoneToSave = formatPhone(phone.trim());
   
    if (!user || !user._id || !token) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin người dùng');
      return;
    }
    
    if (isUploading) {
      Alert.alert('Đang xử lý', 'Vui lòng đợi upload ảnh hoàn tất');
      return;
    }
    
    try {
      let finalAvatarUrl = avatarUrl;
      
      // Nếu có avatar mới (không phải từ server), upload lên server trước
      if (avatarUrl && (avatarUrl.startsWith('file://') || avatarUrl.startsWith('content://'))) {
        try {
          setIsUploading(true);
          console.log('🔄 Đang upload avatar...');
          const uploadRes = await uploadAvatar(token, avatarUrl);
          finalAvatarUrl = uploadRes.data.imageUrl;
          console.log('✅ Upload avatar thành công:', finalAvatarUrl);
        } catch (uploadErr: any) {
          console.error('❌ Upload avatar error:', uploadErr?.response?.data || uploadErr?.message || uploadErr);
          const errorMessage = uploadErr?.response?.data?.message || uploadErr?.message || 'Không thể upload ảnh';
          Alert.alert(
            'Lỗi upload ảnh', 
            `${errorMessage}\n\nVui lòng kiểm tra:\n• Kết nối internet\n• Kích thước ảnh (tối đa 5MB)\n• Định dạng ảnh (JPG, PNG)`,
            [{ text: 'OK' }]
          );
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // Cập nhật thông tin user
      const res = await updateProfile(token, { 
        name, 
        email, 
        phoneNumber: phoneToSave, 
        avatarUrl: finalAvatarUrl 
      });
      setUser(res.data.user);

      // Đồng bộ thông tin với địa chỉ mặc định
      try {
        const addresses = await getUserAddresses(token);
        const defaultAddress = addresses.find(addr => addr.isDefault);
        
        if (defaultAddress && defaultAddress._id) {
          // Cập nhật địa chỉ mặc định với thông tin mới
          await updateAddress(token, defaultAddress._id, {
            name: name.trim(),
            phone: phoneToSave,
            address: defaultAddress.address,
            province: defaultAddress.province,
            district: defaultAddress.district,
            ward: defaultAddress.ward,
            isDefault: true
          });
          console.log('✅ Đã đồng bộ thông tin với địa chỉ mặc định');
        }
      } catch (addressErr: any) {
        console.log('Address sync error:', addressErr?.response?.data || addressErr?.message || addressErr);
        // Không hiển thị lỗi cho user vì cập nhật profile đã thành công
      }

      Alert.alert('Thành công', 'Thông tin đã được cập nhật và đồng bộ với địa chỉ giao hàng', [
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
    router.replace('/profile');
  };
  const handleChangePassword = () => {
    router.push('./change-password');
  };

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Quyền truy cập cần thiết', 
          'Bạn cần cho phép truy cập thư viện ảnh để chọn ảnh đại diện!',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Cài đặt', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('📸 Selected image:', selectedImage);
        
        // Kiểm tra kích thước file (nếu có)
        if (selectedImage.fileSize && selectedImage.fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            'Ảnh quá lớn', 
            'Kích thước ảnh không được vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.',
            [{ text: 'OK' }]
          );
          return;
        }
        
        setAvatarUrl(selectedImage.uri);
        console.log('✅ Avatar URL set:', selectedImage.uri);
      }
    } catch (error: any) {
      console.error('❌ Error picking image:', error);
      Alert.alert(
        'Lỗi chọn ảnh', 
        'Không thể mở thư viện ảnh. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  // Kiểm tra authentication
  if (!token) {
    return (
      <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.replace('/profile')}>
            <Text style={[styles.backButton, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text }]}>Chỉnh sửa hồ sơ</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Authentication Required */}
        <View style={[styles.authRequiredContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.authRequiredIcon, { color: colors.textSecondary }]}>🔒</Text>
          <Text style={[styles.authRequiredTitle, { color: colors.text }]}>Yêu cầu đăng nhập</Text>
          <Text style={[styles.authRequiredMessage, { color: colors.textSecondary }]}>
            Vui lòng đăng nhập để chỉnh sửa thông tin cá nhân
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
          onChangeText={(text) => {
            // Chỉ cho phép nhập số và giới hạn độ dài
            const numericText = text.replace(/[^0-9]/g, '');
            if (numericText.length <= 11) {
              setPhone(numericText);
            }
          }}
          placeholder="Nhập số điện thoại của bạn"
          keyboardType="phone-pad"
          placeholderTextColor={colors.textSecondary}
          maxLength={11}
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
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { 
              backgroundColor: isUploading ? colors.textSecondary : (isDark ? colors.text : '#404040'),
              opacity: isUploading ? 0.7 : 1
            }
          ]} 
          onPress={handleSave}
          disabled={isUploading}
        >
          <Text style={[styles.saveButtonText, { color: isDark ? colors.background : '#fff' }]}>
            {isUploading ? 'Đang lưu...' : 'Lưu'}
          </Text>
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

export default EditProfileScreen;
