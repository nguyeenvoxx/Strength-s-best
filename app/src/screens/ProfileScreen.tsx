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

        <View style={styles.menuItem}>
          <Image source={require('../images/exit.png')} style={styles.icon} />
          <Text style={[styles.menuText, styles.logout]}>Đăng xuất</Text>
        </View>
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
  menuItem: { fontSize: 15, paddingVertical: 10, flexDirection:'row', alignItems: 'center' },
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
});

export default ProfileScreen;