import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useTheme } from '../store/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';
import { getUserAddresses, addAddress, updateAddress, deleteAddress, Address } from '../services/addressApi';

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
}

interface AdministrativeData {
  code: string;
  name: string;
  name_with_type: string;
  type: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onAddressSelect
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#FF6B35',
    border: '#404040',
    white: '#ffffff',
    secondary: '#666666',
    error: '#ff4444'
  } : {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#FF6B35',
    border: '#e0e0e0',
    white: '#ffffff',
    secondary: '#666666',
    error: '#ff4444'
  };
  
  const { token } = useAuthStore();
  
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  // Form data for new/edit address
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    isDefault: false
  });

  // Administrative data
  const [provinces, setProvinces] = useState<AdministrativeData[]>([]);
  const [districts, setDistricts] = useState<AdministrativeData[]>([]);
  const [wards, setWards] = useState<AdministrativeData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Load addresses from API
  const loadAddresses = async () => {
    if (!token) return;
    
    try {
      setLoadingAddresses(true);
      const userAddresses = await getUserAddresses(token);
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load provinces
  const loadProvinces = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/addresses/provinces`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProvinces(data.data.provinces);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  // Load districts based on selected province
  const loadDistricts = async (provinceCode: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/addresses/districts/${provinceCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDistricts(data.data.districts);
      }
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  // Load wards based on selected district
  const loadWards = async (districtCode: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/addresses/wards/${districtCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWards(data.data.wards);
      }
    } catch (error) {
      console.error('Error loading wards:', error);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadProvinces();
  }, [token]);

  const handleAddressSelect = (address: Address) => {
    onAddressSelect(address);
    setShowModal(false);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      
      province: address.province,
      district: address.district,
      ward: address.ward,
      isDefault: address.isDefault || false
    });
    setSelectedProvince(address.province);
    setSelectedDistrict(address.district);
    setShowEditModal(true);
  };

  const handleSaveAddress = async () => {
    // Validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || 
        !formData.province || !formData.district || !formData.ward) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10-11 chữ số');
      return;
    }

    // Name validation
    if (formData.name.trim().length < 2) {
      Alert.alert('Lỗi', 'Tên người nhận phải có ít nhất 2 ký tự');
      return;
    }

    if (!token) {
      Alert.alert('Lỗi', 'Không có token xác thực');
      return;
    }

    try {
      setIsLoading(true);
      
      const addressData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        isDefault: formData.isDefault
      };
      
              if (editingAddress) {
          // Update existing address
          await updateAddress(token, editingAddress._id!, { ...addressData, _id: editingAddress._id! });
          Alert.alert('Thành công', 'Đã cập nhật địa chỉ');
        } else {
          // Add new address
          await addAddress(token, addressData);
          Alert.alert('Thành công', 'Đã thêm địa chỉ mới');
        }
      
      await loadAddresses();
      setShowEditModal(false);
      setEditingAddress(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        isDefault: false
      });
      setSelectedProvince('');
      setSelectedDistrict('');
      setDistricts([]);
      setWards([]);
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu địa chỉ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!token) return;
    
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa địa chỉ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(token, addressId);
              await loadAddresses();
              Alert.alert('Thành công', 'Đã xóa địa chỉ');
            } catch (error: any) {
              console.error('Error deleting address:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa địa chỉ');
            }
          }
        }
      ]
    );
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
          setFormData({
        name: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        isDefault: false
      });
    setSelectedProvince('');
    setSelectedDistrict('');
    setDistricts([]);
    setWards([]);
    setShowEditModal(true);
  };

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setFormData(prev => ({ ...prev, province: provinceCode, district: '', ward: '' }));
    setSelectedDistrict('');
    setDistricts([]);
    setWards([]);
    if (provinceCode) {
      loadDistricts(provinceCode);
    }
  };

  const handleDistrictChange = (districtCode: string) => {
    setSelectedDistrict(districtCode);
    setFormData(prev => ({ ...prev, district: districtCode, ward: '' }));
    setWards([]);
    if (districtCode) {
      loadWards(districtCode);
    }
  };

  const handleWardChange = (wardCode: string) => {
    setFormData(prev => ({ ...prev, ward: wardCode }));
  };

  return (
    <View style={styles.container}>
      {selectedAddress ? (
        <View style={styles.selectedAddress}>
          <Text style={[styles.addressText, { color: colors.text }]}>
            {selectedAddress.name} - {selectedAddress.phone}
          </Text>
                      <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {selectedAddress.address}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
            </Text>
          <TouchableOpacity
            style={[styles.changeButton, { backgroundColor: colors.accent }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowModal(true)}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>Thêm địa chỉ</Text>
        </TouchableOpacity>
      )}

      {/* Modal chọn địa chỉ */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn địa chỉ</Text>
            
            {loadingAddresses ? (
              <ActivityIndicator size="large" color={colors.accent} />
            ) : (
              <ScrollView style={styles.addressList}>
                {addresses.map((address) => (
                  <TouchableOpacity
                    key={address._id}
                    style={[styles.addressItem, { borderColor: colors.border }]}
                    onPress={() => handleAddressSelect(address)}
                  >
                    <View style={styles.addressInfo}>
                      <Text style={[styles.addressName, { color: colors.text }]}>
                        {address.name} - {address.phone}
                      </Text>
                                              <Text style={[styles.addressDetail, { color: colors.textSecondary }]}>
                          {address.address}, {address.ward}, {address.district}, {address.province}
                        </Text>
                      {address.isDefault && (
                        <Text style={[styles.defaultBadge, { color: colors.accent }]}>Mặc định</Text>
                      )}
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                        onPress={() => handleEditAddress(address)}
                      >
                        <Text style={[styles.actionText, { color: colors.white }]}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleDeleteAddress(address._id!)}
                      >
                        <Text style={[styles.actionText, { color: colors.white }]}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={[styles.addNewButton, { backgroundColor: colors.accent }]}
              onPress={handleAddNewAddress}
            >
              <Text style={[styles.buttonText, { color: colors.white }]}>Thêm địa chỉ mới</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.secondary }]}
              onPress={() => setShowModal(false)}
            >
              <Text style={[styles.buttonText, { color: colors.white }]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal thêm/sửa địa chỉ */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Tên người nhận"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Số điện thoại"
              placeholderTextColor={colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text
              }]}
              placeholder="Địa chỉ nhà (số nhà, tên đường, khu phố...)"
              placeholderTextColor={colors.textSecondary}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              multiline
            />

            {/* Province Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Tỉnh/Thành phố</Text>
              <ScrollView style={[styles.dropdown, { borderColor: colors.border }]}>
                {provinces.map((province) => (
                  <TouchableOpacity
                    key={province.code}
                    style={[
                      styles.dropdownItem,
                      selectedProvince === province.code && { backgroundColor: colors.accent }
                    ]}
                    onPress={() => handleProvinceChange(province.code)}
                  >
                    <Text style={[
                      styles.dropdownText,
                      { color: colors.text },
                      selectedProvince === province.code && { color: colors.white }
                    ]}>
                      {province.name_with_type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* District Dropdown */}
            {selectedProvince && (
              <View style={styles.dropdownContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Quận/Huyện</Text>
                <ScrollView style={[styles.dropdown, { borderColor: colors.border }]}>
                  {districts.map((district) => (
                    <TouchableOpacity
                      key={district.code}
                      style={[
                        styles.dropdownItem,
                        selectedDistrict === district.code && { backgroundColor: colors.accent }
                      ]}
                      onPress={() => handleDistrictChange(district.code)}
                    >
                      <Text style={[
                        styles.dropdownText,
                        { color: colors.text },
                        selectedDistrict === district.code && { color: colors.white }
                      ]}>
                        {district.name_with_type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Ward Dropdown */}
            {selectedDistrict && (
              <View style={styles.dropdownContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Phường/Xã</Text>
                <ScrollView style={[styles.dropdown, { borderColor: colors.border }]}>
                  {wards.map((ward) => (
                    <TouchableOpacity
                      key={ward.code}
                      style={[
                        styles.dropdownItem,
                        formData.ward === ward.code && { backgroundColor: colors.accent }
                      ]}
                      onPress={() => handleWardChange(ward.code)}
                    >
                      <Text style={[
                        styles.dropdownText,
                        { color: colors.text },
                        formData.ward === ward.code && { color: colors.white }
                      ]}>
                        {ward.name_with_type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.accent }]}
                onPress={handleSaveAddress}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={[styles.buttonText, { color: colors.white }]}>
                    {editingAddress ? 'Cập nhật' : 'Thêm'}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.secondary }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.buttonText, { color: colors.white }]}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  selectedAddress: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 5,
  },
  changeButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  addButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addressList: {
    maxHeight: 300,
  },
  addressItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  addressInfo: {
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  addressDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  defaultBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addNewButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
});

export default AddressSelector; 