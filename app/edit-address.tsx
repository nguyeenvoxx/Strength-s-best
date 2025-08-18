import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import { updateAddress, Address } from '../services/addressApi';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

const EditAddressScreen: React.FC = () => {
  const router = useRouter();
  const { address } = useLocalSearchParams();
  const { user, token } = useAuthStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    isDefault: false
  });

  const [loading, setLoading] = useState(false);
  const [addressId, setAddressId] = useState<string>('');

  useEffect(() => {
    if (address) {
      try {
        const addressData = JSON.parse(address as string);
        setFormData({
          name: addressData.name || '',
          phone: addressData.phone || '',
          address: addressData.address || '',
          isDefault: addressData.isDefault || false
        });
        setAddressId(addressData._id || '');
      } catch (error) {
        console.error('Error loading address:', error);
        Alert.alert('Thông báo', 'Không thể tải thông tin địa chỉ');
      }
    }
  }, [address]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập lại');
      return;
    }

    if (!addressId) {
      Alert.alert('Thông báo', 'Không tìm thấy địa chỉ cần cập nhật');
      return;
    }

    if (!formData.name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên người nhận');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại');
      return;
    }
    // Validate phone number
    const normalizedPhone = formData.phone.replace(/\s+/g, '');
    if (!/^0\d{9,10}$/.test(normalizedPhone)) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10-11 chữ số bắt đầu bằng 0');
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ');
      return;
    }

    try {
      setLoading(true);
      
      const addressData = {
        name: formData.name.trim(),
        phone: normalizedPhone,
        address: formData.address.trim(),
        province: '', // Bỏ trống vì không còn chọn
        district: '', // Bỏ trống vì không còn chọn
        ward: '', // Bỏ trống vì không còn chọn
        isDefault: formData.isDefault
      };

      await updateAddress(token, addressId, addressData);
      // Sau khi cập nhật, điều hướng với query để AddressSelector refresh ngay
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ', [
        { text: 'OK', onPress: () => router.replace('/select-address?refresh=true') }
      ]);
    } catch (error: any) {
      console.error('Error updating address:', error);
      Alert.alert('Thông báo', error.message || 'Không thể cập nhật địa chỉ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/select-address')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chỉnh sửa địa chỉ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin địa chỉ</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Tên người nhận *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Nhập tên người nhận"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Số điện thoại *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.phone}
              onChangeText={(value) => {
                // Chỉ cho phép nhập số và giới hạn độ dài
                const numericText = value.replace(/[^0-9]/g, '');
                if (numericText.length <= 11) {
                  handleInputChange('phone', numericText);
                }
              }}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Địa chỉ *</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
          >
            <View style={[
              styles.checkbox,
              formData.isDefault && { backgroundColor: colors.accent, borderColor: colors.accent }
            ]}>
              {formData.isDefault && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Đặt làm địa chỉ mặc định
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}> 
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: '#469B43' }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Đang lưu...' : 'Xác nhận'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitContainer: {
    padding: 16,
    paddingBottom: 100, // Tăng padding phía dưới
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditAddressScreen; 