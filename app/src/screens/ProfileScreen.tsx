import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={require('../images/avatar.png')} style={styles.avatar} />
        <Text style={styles.name}>Tâm nhân</Text>
        <Text style={styles.email}>nhan@gmail.com</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>
      <View style={styles.menu}>
        <Text style={styles.menuItem}>Trạng thái hoạt động</Text>
        <Text style={styles.menuItem}>Địa chỉ</Text>
        <Text style={styles.menuItem}>Đơn hàng & phân phối</Text>
        <Text style={[styles.menuItem, styles.logout]}>Đăng xuất</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  button: { backgroundColor: '#000', padding: 10, alignItems: 'center', marginBottom: 20 },
  menu: { padding: 10 },
  name: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  email: { color: '#666', fontSize: 13 },
  menuItem: { fontSize: 15, paddingVertical: 10 },
  logout: { color: 'red', marginTop: 20 },
  editText: { color: '#fff', fontSize: 14 }
});

export default ProfileScreen;