import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../store/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';
import { Address, getUserAddresses } from '../services/addressApi';
import { useSimpleDataSync } from '../hooks/useSimpleDataSync';

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ selectedAddress, onAddressSelect }) => {
  const { theme } = useTheme();
  const { token, user } = useAuthStore();
  const router = useRouter();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#5CB85C',
    border: '#404040'
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#469B43',
    border: '#e0e0e0'
  };

  // Use custom hook for data synchronization
  const {
    data: addresses,
    loading: addressesLoading,
    refresh: refreshAddresses,
    lastUpdated: addressesLastUpdated
  } = useSimpleDataSync(
    async (token: string) => {
      const userAddresses = await getUserAddresses(token);
      return userAddresses;
    },
    {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
      cacheTime: 60000 // 1 minute
    }
  );

  // Refresh addresses when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        console.log('🔄 Refreshing addresses on focus...');
        // Refresh ngay lập tức khi quay lại từ trang thêm/sửa địa chỉ
        refreshAddresses();
      }
    }, [token, refreshAddresses])
  );



  // Update selected address when addresses change (e.g., after adding/editing)
  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddress) {
      // Kiểm tra xem địa chỉ đang chọn có còn tồn tại không
      const currentAddressExists = addresses.find(addr => addr._id === selectedAddress._id);
      if (!currentAddressExists) {
        // Nếu địa chỉ đang chọn không còn tồn tại, chọn địa chỉ mặc định
        const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
        if (defaultAddress) {
          console.log('📍 Updating selected address after change:', defaultAddress.name);
          onAddressSelect(defaultAddress);
        }
      }
    }
  }, [addresses, selectedAddress, onAddressSelect]);

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      console.log('📍 Auto-selecting default address:', defaultAddress.name, defaultAddress.address);
      onAddressSelect(defaultAddress);
    }
  }, [addresses, selectedAddress, onAddressSelect]);





  const handleAddNewAddress = () => {
    router.push('/add-address');
  };

  const handleOpenModal = async () => {
    console.log('🔍 Navigating to select-address page...');
    // Chuyển đến trang select-address thay vì mở modal
    router.push('/select-address');
  };

  const handleEditAddress = (address: Address) => {
    router.push({
      pathname: '/edit-address',
      params: { addressId: address._id }
    } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Địa chỉ giao hàng
        </Text>
        <TouchableOpacity onPress={handleOpenModal}>
          <Text style={[styles.changeText, { color: colors.accent }]}>
            Thay đổi
          </Text>
        </TouchableOpacity>
      </View>

      {selectedAddress ? (
        <View style={styles.selectedAddress}>
          <View style={styles.addressInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {selectedAddress.name || (selectedAddress as any)?.fullName || user?.name || 'Người nhận'}
            </Text>
            <Text style={[styles.phone, { color: colors.textSecondary }]}>
              {selectedAddress.phone}
            </Text>
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {selectedAddress.address}
              {selectedAddress.ward && `, ${selectedAddress.ward}`}
              {selectedAddress.district && `, ${selectedAddress.district}`}
              {selectedAddress.province && `, ${selectedAddress.province}`}
              {(selectedAddress as any).city && `, ${(selectedAddress as any).city}`}
            </Text>
            <Text style={[styles.fullAddress, { color: colors.textSecondary }]}>
              {selectedAddress.address}
              {selectedAddress.ward && `, ${selectedAddress.ward}`}
              {selectedAddress.district && `, ${selectedAddress.district}`}
              {selectedAddress.province && `, ${selectedAddress.province}`}
              {(selectedAddress as any).city && `, ${(selectedAddress as any).city}`}
              {', Việt Nam'}
            </Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.addAddressButton, { borderColor: colors.border }]}
          onPress={handleAddNewAddress}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
          <Text style={[styles.addAddressText, { color: colors.accent }]}>
            Thêm địa chỉ giao hàng
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    lineHeight: 20,
  },
  fullAddress: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    fontStyle: 'italic',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressInfo: {
    flex: 1,
  },

});

export default AddressSelector;