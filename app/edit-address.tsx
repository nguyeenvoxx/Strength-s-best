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
  const { user } = useAuthStore();
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
        console.error('Lỗi khi parse địa chỉ:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ');
      }
    }
  }, [address]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return;
    }

    try {
      setLoading(true);
      await updateAddress(addressId, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        isDefault: formData.isDefault
      });
      
      Alert.alert('Thành công', 'Đã cập nhật địa chỉ', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật địa chỉ:', error);
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể cập nhật địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chỉnh sửa địa chỉ</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin địa chỉ</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Tên người nhận *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground, 
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
                backgroundColor: colors.inputBackground, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Nhập số điện thoại"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Địa chỉ *</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: colors.inputBackground, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Nhập địa chỉ chi tiết"
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
      <View style={[styles.bottomContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.accent }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <Text style={[styles.submitButtonText, { color: '#fff' }]}>Đang cập nhật...</Text>
          ) : (
            <Text style={[styles.submitButtonText, { color: '#fff' }]}>Cập nhật địa chỉ</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#469B43',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditAddressScreen; 