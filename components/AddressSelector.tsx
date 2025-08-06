import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../store/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';
import { Address, getUserAddresses } from '../services/addressApi';

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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, [token]);

  const loadAddresses = async () => {
    try {
      if (!token) return;
      const userAddresses = await getUserAddresses(token);
      setAddresses(userAddresses);
      
      // Nếu chưa có địa chỉ được chọn, chọn địa chỉ mặc định
      if (!selectedAddress && userAddresses.length > 0) {
        const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
        onAddressSelect(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleAddressSelect = (address: Address) => {
    onAddressSelect(address);
    setShowModal(false);
  };

  const handleAddNewAddress = () => {
    setShowModal(false);
    router.push('/add-address');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Địa chỉ giao hàng
        </Text>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Text style={[styles.changeText, { color: colors.accent }]}>
            Thay đổi
          </Text>
        </TouchableOpacity>
      </View>

      {selectedAddress ? (
        <View style={styles.selectedAddress}>
          <View style={styles.addressInfo}>
            <Text style={[styles.name, { color: colors.text }]}>
              {selectedAddress.name}
            </Text>
            <Text style={[styles.phone, { color: colors.textSecondary }]}>
              {selectedAddress.phone}
            </Text>
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {selectedAddress.address}
              {selectedAddress.ward && `, ${selectedAddress.ward}`}
              {selectedAddress.district && `, ${selectedAddress.district}`}
              {selectedAddress.province && `, ${selectedAddress.province}`}
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
            
            <ScrollView style={styles.addressList}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address._id}
                  style={[styles.addressItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleAddressSelect(address)}
                >
                  <View style={styles.addressItemInfo}>
                    <Text style={[styles.addressItemName, { color: colors.text }]}>
                      {address.name}
                    </Text>
                    <Text style={[styles.addressItemPhone, { color: colors.textSecondary }]}>
                      {address.phone}
                    </Text>
                    <Text style={[styles.addressItemAddress, { color: colors.textSecondary }]}>
                      {address.address}
                      {address.ward && `, ${address.ward}`}
                      {address.district && `, ${address.district}`}
                      {address.province && `, ${address.province}`}
                    </Text>
                  </View>
                  {selectedAddress?._id === address._id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.addNewButton, { backgroundColor: colors.accent }]}
              onPress={handleAddNewAddress}
            >
              <Text style={styles.addNewButtonText}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
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
  addressInfo: {
    flex: 1,
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
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  addressItemInfo: {
    flex: 1,
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
  addNewButton: {
    margin: 20,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addNewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddressSelector;