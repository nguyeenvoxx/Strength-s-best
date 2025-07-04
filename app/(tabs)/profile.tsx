import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { getPlatformContainerStyle } from '../../utils/platformUtils';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [logoutVisible, setlougoutVisible] = useState(false);
  
  const handleLogout = () => {
    setlougoutVisible(false);
    logout();
    alert('Đã đăng xuất thành công!');
    router.push('/(auth)/sign-in');
  };
  
  const handleLogin = () => {
    router.push('/(auth)/sign-in');
  };
  
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.guestContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={50} color="#666" />
          </View>
          <Text style={styles.guestText}>Bạn chưa đăng nhập</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, getPlatformContainerStyle()]}>
      <View style={styles.profileHeader}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={50} color="#666" />
          </View>
        )}
        <View style={styles.infor}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.push('../../edit-profile')}>
        <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>
      <View style={styles.menu}>
        <View style={styles.menuItem}>
          <Image source={require('../../assets/images/activity.png')} style={styles.icon} />
          <Text style={styles.menuText}>Trạng thái hoạt động</Text>
        </View>

        <View style={styles.menuItem}>
          <Image source={require('../../assets/images/pin.png')} style={styles.icon} />
          <Text style={styles.menuText}>Địa chỉ</Text>
          <Image source={require('../../assets/images/arrow.png')} style={styles.arrow} />
        </View>

        <View style={styles.menuItem}>
          <Image source={require('../../assets/images/Question.png')} style={styles.icon} />
          <Text style={styles.menuText}>Trợ giúp & phản hồi</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => setlougoutVisible(true)}>
          <Image source={require('../../assets/images/exit.png')} style={styles.icon} />
          <Text style={[styles.menuText, styles.logout]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={require('../../assets/images/exit.png')} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Xác nhận đăng xuất</Text>
            <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất không ?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setlougoutVisible(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowRadius: 4,
    elevation: 10,
    marginHorizontal: 10,
    marginTop: 20,
  },
  infor: {
    flexDirection: 'column'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 25,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guestText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#000',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  menu: {
    padding: 10
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15
  },
  email: {
    color: '#666',
    fontSize: 13
  },
  menuItem: {
    fontSize: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  logout: {
    color: 'red'
  },
  editText: {
    color: '#fff',
    fontSize: 14
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginRight: 10,
  },
  menuText: {
    fontSize: 15,
  },
  arrow: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginLeft: 'auto',
    tintColor: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalMessage: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 10
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 10,
    width: '100%'
  },
  modalIcon: {
    width: 50,
    height: 50,
    tintColor: 'red',
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 10,
    borderRadius: 8,
    marginRight: 25,
    alignItems: 'center',
    width: 102
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#6AF039',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: 102
  },
  cancelText: {
    color: '#FFFFFF'
  },
  logoutText: {
    color: '#000000'
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 30,
    marginBottom: 20,
  },
});

export default ProfileScreen;
