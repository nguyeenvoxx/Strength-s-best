import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: 'path_to_image' }} style={styles.avatar} />
        <Text>Tâm nhân</Text>
        <Text>nhan@gmail.com</Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>
      <View style={styles.menu}>
        <Text>Trạng thái hoạt động</Text>
        <Text>Địa chỉ</Text>
        <Text>Đơn hàng & phân phối</Text>
        <Text style={styles.logout}>Đăng xuất</Text>
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
  logout: { color: 'red', marginTop: 20 },
});

export default ProfileScreen;