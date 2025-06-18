import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';


type RootStackParamList = {
  SignIn: undefined;
  EmailVerification: undefined;
  Checkout: undefined
  EditProfile: undefined
};

type NavigationProp = StackNavigationProp<RootStackParamList>;
const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chỉnh sửa hồ sơ</Text>
      <View style={styles.profileHeader}>
        <Image source={require('../images/avatar.png')} style={styles.avatar} />
        <TouchableOpacity>
          <Image source={require('../images/camera.png')} style={styles.cameraImage} />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Đổi mật khẩu</Text>
      {/* <Text style={styles.label}>Mật khẩu cũ</Text> */}
      <TextInput style={styles.input} secureTextEntry placeholder="VuDuyPhuc" />
      {/* <Text style={styles.label}>Mật khẩu mới</Text> */}
      <TextInput style={styles.input} secureTextEntry placeholder="vuduyphuc674@gmail.com" />
      {/* <Text style={styles.label}>Xác nhận mật khẩu mới</Text> */}
      <TouchableOpacity style={styles.passwordRow} onPress={() => navigation.navigate('Checkout')}>
        <Text style={styles.passwordLabel}>Đổi mật khẩu</Text>
        <Text style={styles.arrow}>{'>'}</Text>
      </TouchableOpacity>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // container: { flex: 1, padding: 10, justifyContent: 'center' },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  cameraImage: {
    width: 20,
    height: 20
  },
  arrow: {
    fontSize: 18,
    color: '#000',
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 20,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 110 / 2 - 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  passwordLabel: {
    fontSize: 16,
    color: '#000',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 32,
  },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 5, marginBottom: 20, fontSize: 14, paddingHorizontal: 0 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  cancelButton: { backgroundColor: '#F35A5A63', padding: 10, flex: 1, alignItems: 'center', marginRight: 10, borderRadius: 10 },
  saveButton: { backgroundColor: '#404040', padding: 10, flex: 1, alignItems: 'center', marginLeft: 5, borderRadius: 10  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold'
  },
  cancelButtonText: {
    color: '#f55',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default EditProfileScreen;