import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface HomeHeaderProps {
  onMenuPress?: () => void;
  onUserPress?: () => void;
  user?: User | null;
  isAuthenticated?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ onMenuPress, onUserPress, user, isAuthenticated }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Menu Icon */}        
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* User Info */}
        <TouchableOpacity style={styles.userContainer} onPress={onUserPress}>
          {isAuthenticated && user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Xin chào</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {isAuthenticated && user ? user.name : 'Khách'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    height: 32,
    maxWidth: 120,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 120,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeHeader;