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
  const { token } = useAuthStore();
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

  const [showModal, setShowModal] = useState(false);

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
        refreshAddresses();
      }
    }, [token, refreshAddresses])
  );

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      onAddressSelect(defaultAddress);
    }
  }, [addresses, selectedAddress, onAddressSelect]);

  const [tempSelectedAddress, setTempSelectedAddress] = useState<Address | null>(null);

  const handleAddressSelect = (address: Address) => {
    setTempSelectedAddress(address);
  };

  const handleConfirmSelection = () => {
    if (tempSelectedAddress) {
      onAddressSelect(tempSelectedAddress);
    }
    setShowModal(false);
    setTempSelectedAddress(null);
  };

  const handleCancelSelection = () => {
    setTempSelectedAddress(selectedAddress);
    setShowModal(false);
  };

  const handleAddNewAddress = () => {
    setShowModal(false);
    router.push('/add-address');
  };

  const handleOpenModal = async () => {
    console.log('🔍 Opening address modal...');
    setTempSelectedAddress(selectedAddress);
    setShowModal(true);
    // Refresh addresses when modal opens
    await refreshAddresses();
    console.log('🔍 Addresses after refresh:', addresses?.length || 0);
  };

  const handleEditAddress = (address: Address) => {
    setShowModal(false);
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
              {selectedAddress.name || (selectedAddress as any)?.fullName || 'Người nhận'}
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

      {/* Address Selection Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chọn địa chỉ giao hàng
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
                        {addressesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Đang tải địa chỉ...
                </Text>
              </View>
            ) : !addresses || addresses.length === 0 ? (
              <View style={styles.emptyAddresses}>
                <Ionicons name="location-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyAddressesText, { color: colors.textSecondary }]}>
                  Chưa có địa chỉ nào
                </Text>
                <Text style={[styles.emptyAddressesSubtext, { color: colors.textSecondary }]}>
                  Hãy thêm địa chỉ để tiếp tục
                </Text>
              </View>
            ) : (
              <FlatList
                data={addresses}
                keyExtractor={(item) => item._id || Math.random().toString()}
                renderItem={({ item: address }) => (
                  <TouchableOpacity
                    style={[styles.addressItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View style={styles.addressInfo}>
                      <View style={styles.addressItemHeader}>
                        <Text style={[styles.addressItemName, { color: colors.text }]}>
                          {address.name || (address as any)?.fullName || 'Người nhận'}
                        </Text>
                        {address.isDefault && (
                          <View style={[styles.defaultBadge, { backgroundColor: colors.accent }]}>
                            <Text style={styles.defaultBadgeText}>Mặc định</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={[styles.addressItemPhone, { color: colors.textSecondary }]}>
                        {address.phone}
                      </Text>
                      
                      <Text style={[styles.addressItemAddress, { color: colors.textSecondary }]}>
                        {address.address}
                        {address.ward && `, ${address.ward}`}
                        {address.district && `, ${address.district}`}
                        {address.province && `, ${address.province}`}
                        {(address as any).city && `, ${(address as any).city}`}
                      </Text>
                    </View>
                    
                    <View style={styles.addressActions}>
                      {tempSelectedAddress?._id === address._id && (
                        <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditAddress(address)}
                      >
                        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
                style={styles.addressList}
                showsVerticalScrollIndicator={false}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.addNewButton, { backgroundColor: colors.accent }]}
                onPress={handleAddNewAddress}
              >
                <Text style={styles.addNewButtonText}>Thêm địa chỉ mới</Text>
              </TouchableOpacity>
              
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleCancelSelection}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: colors.accent }]}
                  onPress={handleConfirmSelection}
                  disabled={!tempSelectedAddress}
                >
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  addressInfo: {
    flex: 1,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
  },
  emptyAddresses: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAddressesText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyAddressesSubtext: {
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  addressItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressItemPhone: {
    fontSize: 14,
    marginBottom: 4,
  },
  addressItemAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressItemFullAddress: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    fontStyle: 'italic',
  },
  addNewButton: {
    backgroundColor: '#469B43',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  addNewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default AddressSelector;