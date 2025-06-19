import React from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
  onMicPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Tìm kiếm bất kỳ sản phẩm nào...",
  value = "",
  onChangeText,
  onSearch,
  onMicPress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color="#888" 
          style={styles.searchIcon} 
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        
        <TouchableOpacity 
          style={styles.micButton}
          onPress={onMicPress}
        >
          <Ionicons name="mic-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  micButton: {
    marginLeft: 8,
    padding: 4,
  }
});

export default SearchBar;