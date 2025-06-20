import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal } from 'react-native';

type RootStackParamList = {
  EditProfile: undefined
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [logoutVisible, setlougoutVisible] = useState(false)

  const handleLogout = () => {
    setlougoutVisible(false);
    alert('Đã đăng xuất thành công!');
  };
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={require('../images/avatar.png')} style={styles.avatar} />
        <Text style={styles.name}>Tâm nhân</Text>
        <Text style={styles.email}>nhan@gmail.com</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>
      <View style={styles.menu}>
        <View style={styles.menuItem}>
          <Image source={require('../images/activity.png')} style={styles.icon} />
          <Text style={styles.menuText}>Trạng thái hoạt động</Text>
        </View>

        <View style={styles.menuItem}>
          <Image source={require('../images/pin.png')} style={styles.icon} />
          <Text style={styles.menuText}>Địa chỉ</Text>
          <Image source={require('../images/arrow.png')} style={styles.arrow} />
        </View>

        <View style={styles.menuItem}>
          <Image source={require('../images/Question.png')} style={styles.icon} />
          <Text style={styles.menuText}>Trợ giúp & phản hồi</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => setlougoutVisible(true)}>
          <Image source={require('../images/exit.png')} style={styles.icon} />
          <Text style={[styles.menuText, styles.logout]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={logoutVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={require('../images/exit.png')} style={styles.modalIcon} />
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
  container: { flex: 1, padding: 10 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  button: { backgroundColor: '#000', padding: 10, alignItems: 'center', marginBottom: 20, borderRadius: 10 },
  menu: { padding: 10 },
  name: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  email: { color: '#666', fontSize: 13 },
  menuItem: { fontSize: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  logout: { color: 'red' },
  editText: { color: '#fff', fontSize: 14 },
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
  modalMessage: { textAlign: 'center', color: '#666', marginVertical: 10 },
  modalButtons: { flexDirection: 'row', marginTop: 10, width: '100%' },
  modalIcon: { width: 50, height: 50, tintColor: 'red', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  cancelButton: {
    flex: 1, backgroundColor: '#eee', padding: 10, borderRadius: 8, marginRight: 25, alignItems: 'center', width: 102
  },
  logoutButton: {
    flex: 1, backgroundColor: '#F03939', padding: 10, borderRadius: 8, alignItems: 'center', width: 102
  },
  cancelText: { color: '#000' },
  logoutText: { color: '#000000' },
});

export default ProfileScreen;