import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CheckoutScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>Mật khẩu cũ</Text>
      <TextInput style={styles.input} />
      <Text>Mật khẩu mới</Text>
      <TextInput style={styles.input} />
      <Text>Xác nhận mật khẩu mới</Text>
      <TextInput style={styles.input} />
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton}>
          <Text>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cancelButton: { backgroundColor: '#ff69b4', padding: 10, flex: 1, alignItems: 'center', marginRight: 5 },
  saveButton: { backgroundColor: '#000', padding: 10, flex: 1, alignItems: 'center', marginLeft: 5 },
});

export default CheckoutScreen;