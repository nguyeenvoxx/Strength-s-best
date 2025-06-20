import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


type RootStackParamList = {
  SignIn: undefined;
  EditProfile: undefined
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đổi mật khẩu</Text>
      <Text style={styles.label}>Mật khẩu cũ</Text>
      <TextInput style={styles.input} secureTextEntry placeholder="Nhập mật khẩu cũ"/>
      <Text style={styles.label}>Mật khẩu mới</Text>
      <TextInput style={styles.input} secureTextEntry placeholder="Nhập mật khẩu mới"/>
      <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
      <TextInput style={styles.input} secureTextEntry placeholder="Nhập lại mật khẩu mới"/>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 32,
  },
  input: { borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 5, marginBottom: 20, fontSize: 14, paddingHorizontal: 0 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  cancelButton: { backgroundColor: '#F35A5A63', padding: 10, flex: 1, alignItems: 'center', marginRight: 5, borderRadius: 10 },
  saveButton: { backgroundColor: '#404040', padding: 10, flex: 1, alignItems: 'center', marginLeft: 5, borderRadius: 10 },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold'
  },
  cancelButtonText: {
    color: '#f55',
    fontWeight: 'bold',
  },
  saveButtonText : {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default CheckoutScreen;