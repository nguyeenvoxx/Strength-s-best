import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault?: boolean;
}

const SelectAddressScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem('userAddresses');
      if (savedAddresses) {
        const parsedAddresses = JSON.parse(savedAddresses);
        setAddresses(parsedAddresses);
        
        // Tìm địa chỉ mặc định hoặc địa chỉ đầu tiên
        const defaultAddress = parsedAddresses.find((addr: Address) => addr.isDefault) || parsedAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        // Tạo địa chỉ mặc định từ thông tin user
        const defaultAddress: Address = {
          id: '1',
          name: user?.name || 'Khách hàng',
          phone: user?.phoneNumber || '',
          address: user?.address || 'Chưa có địa chỉ',
          isDefault: true
        };
        setAddresses([defaultAddress]);
        setSelectedAddressId(defaultAddress.id);
        await AsyncStorage.setItem('userAddresses', JSON.stringify([defaultAddress]));
      }
    } catch (error) {
      console.error('Lỗi khi tải địa chỉ:', error);
    }
  };

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleEditAddress = (address: Address) => {
    router.push({
      pathname: '/edit-address',
      params: { address: JSON.stringify(address) }
    });
  };

  const handleAddNewAddress = () => {
    router.push('/add-address');
  };

  const handleConfirmAddress = async () => {
    if (!selectedAddressId) {
      Alert.alert('Thông báo', 'Vui lòng chọn một địa chỉ nhận hàng');
      return;
    }

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (selectedAddress) {
      // Lưu địa chỉ đã chọn
      await AsyncStorage.setItem('selectedDeliveryAddress', JSON.stringify(selectedAddress));
      
      // Quay lại màn hình checkout với địa chỉ mới
      router.back();
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    
    setAddresses(updatedAddresses);
    await AsyncStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
  };

  return (
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chọn địa chỉ nhận hàng</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Address List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Địa chỉ</Text>
        
        {addresses.map((address) => (
          <View key={address.id} style={[styles.addressCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <TouchableOpacity 
              style={styles.addressContent}
              onPress={() => handleSelectAddress(address.id)}
            >
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioButton,
                  selectedAddressId === address.id && styles.radioButtonSelected,
                  { borderColor: colors.border }
                ]}>
                  {selectedAddressId === address.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
              
              <View style={styles.addressInfo}>
                <Text style={[styles.addressName, { color: colors.text }]}>{address.name}</Text>
                <Text style={[styles.addressPhone, { color: colors.textSecondary }]}>{address.phone}</Text>
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>{address.address}</Text>
                {address.isDefault && (
                  <View style={[styles.defaultTag, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.defaultTagText, { color: '#fff' }]}>Mặc định</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEditAddress(address)}
              >
                <Text style={[styles.editButtonText, { color: colors.accent }]}>Sửa</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            
            {!address.isDefault && (
              <TouchableOpacity 
                style={styles.setDefaultButton}
                onPress={() => handleSetDefault(address.id)}
              >
                <Text style={[styles.setDefaultText, { color: colors.accent }]}>Đặt làm mặc định</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Add New Address Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]} onPress={handleAddNewAddress}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Thêm Địa Chỉ Mới</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.confirmButton, { backgroundColor: colors.accent }]}
          onPress={handleConfirmAddress}
          disabled={!selectedAddressId}
        >
          <Text style={[styles.confirmButtonText, { color: '#fff' }]}>Xác nhận</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#469B43',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#469B43',
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  defaultTag: {
    backgroundColor: '#469B43',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  defaultTagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editButtonText: {
    color: '#469B43',
    fontSize: 14,
    fontWeight: '500',
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  setDefaultText: {
    color: '#469B43',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#469B43',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#469B43',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SelectAddressScreen; 