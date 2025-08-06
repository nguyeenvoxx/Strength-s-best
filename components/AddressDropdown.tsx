import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface DropdownOption {
  code: string;
  name: string;
}

interface AddressDropdownProps {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (option: DropdownOption) => void;
  disabled?: boolean;
  loading?: boolean;
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedValue,
  onSelect,
  disabled = false,
  loading = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options);

  useEffect(() => {
    console.log('🔍 AddressDropdown - Options:', options?.length, 'items');
    console.log('🔍 AddressDropdown - Selected value:', selectedValue);
    console.log('🔍 AddressDropdown - Label:', label);
    
    const option = options.find(opt => opt.code === selectedValue);
    setSelectedOption(option || null);
    setFilteredOptions(options);
  }, [selectedValue, options]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchText, options]);

  const handleSelect = (option: DropdownOption) => {
    setSelectedOption(option);
    onSelect(option);
    setModalVisible(false);
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.optionText}>{item.name}</Text>
      {selectedValue === item.code && (
        <Ionicons name="checkmark" size={20} color="#28a745" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.dropdownText,
          !selectedOption && styles.placeholderText,
          disabled && styles.disabledText
        ]}>
          {loading ? 'Đang tải...' : (selectedOption ? selectedOption.name : placeholder)}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={disabled ? "#ccc" : "#666"} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn {label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={filteredOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.code}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: 56, // Chiều cao của mỗi item
                offset: 56 * index,
                index,
              })}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  optionsList: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default AddressDropdown;