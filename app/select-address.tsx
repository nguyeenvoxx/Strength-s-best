import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlatformContainerStyle } from '../utils/platformUtils';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { getUserAddresses, setDefaultAddress, deleteAddress, Address } from '../services/addressApi';

const SelectAddressScreen: React.FC = () => {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const { user, token, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  useEffect(() => {
    console.log('🔍 SelectAddress - useEffect triggered, token:', token ? 'Present' : 'Missing');
    console.log('🔍 SelectAddress - isAuthenticated:', isAuthenticated);
    console.log('🔍 SelectAddress - refresh param:', refresh);
    if (token && isAuthenticated) {
      loadAddresses();
    }
  }, [token, isAuthenticated, refresh]);

  const loadAddresses = async () => {
    if (!token) {
      console.warn('🔍 SelectAddress - No token available for loading addresses');
      return;
    }
    
    try {
      console.log('🔍 SelectAddress - Loading addresses with token length:', token.length);
      setLoading(true);
      const userAddresses = await getUserAddresses(token);
      
      console.log('🔍 SelectAddress - Loaded addresses:', userAddresses.length);
      console.log('🔍 SelectAddress - Addresses:', userAddresses);
      
      setAddresses(userAddresses);
      
      // Tìm địa chỉ mặc định hoặc địa chỉ đầu tiên
      const defaultAddress = userAddresses.find((addr: Address) => addr.isDefault) || userAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id || '');
        console.log('🔍 SelectAddress - Selected address:', defaultAddress._id);
      }
    } catch (error: any) {
      console.error('Error loading addresses:', error);
      Alert.alert('Thông báo', 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (addressId: string) => {
    console.log('🔍 SelectAddress - Selecting address:', addressId);
    console.log('🔍 SelectAddress - Previous selected:', selectedAddressId);
    setSelectedAddressId(addressId);
    console.log('🔍 SelectAddress - New selected:', addressId);
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
    console.log('🔍 SelectAddress - Confirming address, selectedAddressId:', selectedAddressId);
    if (!selectedAddressId) {
      Alert.alert('Thông báo', 'Không tìm thấy địa chỉ đã chọn');
      return;
    }
    const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
    console.log('🔍 SelectAddress - Found selected address:', selectedAddress);
    if (selectedAddress) {
      await AsyncStorage.setItem('selectedDeliveryAddress', JSON.stringify(selectedAddress));
      console.log('🔍 SelectAddress - Saved to AsyncStorage, navigating to checkout');
      router.replace('/checkout');
    } else {
      console.log('🔍 SelectAddress - Selected address not found in addresses array');
      Alert.alert('Lỗi', 'Không tìm thấy địa chỉ đã chọn');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      if (!token) {
        Alert.alert('Thông báo', 'Vui lòng đăng nhập lại');
        return;
      }
      await setDefaultAddress(token, addressId);
      await loadAddresses(); // Reload addresses after update
      Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      console.error('Lỗi khi đặt địa chỉ mặc định:', error);
      Alert.alert('Lỗi', 'Không thể đặt địa chỉ mặc định');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!token) {
                Alert.alert('Thông báo', 'Vui lòng đăng nhập lại');
                return;
              }
              await deleteAddress(token, addressId);
              await loadAddresses(); // Reload addresses after deletion
              Alert.alert('Thành công', 'Đã xóa địa chỉ');
            } catch (error: any) {
              console.error('Error deleting address:', error);
              Alert.alert('Thông báo', 'Không thể xóa địa chỉ');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.replace('/checkout')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chọn địa chỉ nhận hàng</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Đang tải địa chỉ...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, getPlatformContainerStyle(), { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.replace('/checkout')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chọn địa chỉ nhận hàng</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Address List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Địa chỉ ({addresses.length})</Text>
        
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Chưa có địa chỉ nào</Text>
            <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Vui lòng thêm địa chỉ mới</Text>
          </View>
        ) : (
          addresses.map((address, index) => {
            console.log('🔍 SelectAddress - Rendering address:', address._id, 'Selected:', selectedAddressId, 'Match:', selectedAddressId === address._id);
            return (
            <View key={address._id || `address-${index}`} style={[styles.addressCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <View style={styles.addressContent}>
              <TouchableOpacity 
                style={styles.selectableArea}
                onPress={() => handleSelectAddress(address._id || '')}
              >
                <View style={styles.radioContainer}>
                                  <View style={[
                  styles.radioButton,
                  selectedAddressId && address._id && selectedAddressId === address._id && styles.radioButtonSelected,
                  { borderColor: colors.border }
                ]}>
                  {selectedAddressId && address._id && selectedAddressId === address._id && (
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
              </TouchableOpacity>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditAddress(address)}
                >
                  <Text style={[styles.editButtonText, { color: colors.accent }]}>Sửa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAddress(address._id || '')}
                >
                  <Text style={[styles.deleteButtonText, { color: colors.danger }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {!address.isDefault && (
              <TouchableOpacity 
                style={styles.setDefaultButton}
                onPress={() => handleSetDefault(address._id || '')}
              >
                <Text style={[styles.setDefaultText, { color: colors.accent }]}>Đặt làm mặc định</Text>
              </TouchableOpacity>
            )}
          </View>
        );
        })
        )}
      </ScrollView>

      {/* Add New Address Button */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.accent }]} onPress={handleAddNewAddress}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={[styles.addButtonText, { color: '#fff' }]}>Thêm Địa Chỉ Mới</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            { backgroundColor: selectedAddressId ? colors.accent : colors.textSecondary }
          ]}
          onPress={handleConfirmAddress}
          disabled={!selectedAddressId}
        >
          <Text style={[styles.confirmButtonText, { color: '#fff' }]}>
            {selectedAddressId ? 'Xác nhận' : 'Vui lòng chọn địa chỉ'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  selectableArea: {
    flex: 1,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    color: '#469B43',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#ff4444',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SelectAddressScreen; 