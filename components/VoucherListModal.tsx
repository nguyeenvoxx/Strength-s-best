import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface Voucher {
  _id: string;
  description: string;
  expiryDate: string;
}

interface Props {
  vouchers: Voucher[];
  onApply: (voucher: Voucher) => void;
  onDelete: (voucherId: string) => void;
  onClose: () => void;
}

const VoucherListModal: React.FC<Props> = ({ vouchers, onApply, onDelete, onClose }) => (
  <View style={styles.modalContainer}>
    <Text style={styles.title}>Chọn mã giảm giá</Text>
    <ScrollView>
      {(vouchers || []).map((voucher, idx) => (
        <View key={voucher._id || idx} style={styles.voucherCard}>
          <Text style={styles.desc}>{voucher.description}</Text>
          <Text style={styles.date}>{new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.applyBtn} onPress={() => onApply(voucher)}>
              <Text style={styles.applyText}>Áp dụng</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(voucher._id)}>
              <Text style={styles.deleteText}>Xoá</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
      <Text style={styles.closeText}>Đóng</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  modalContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20, maxHeight: '80%' },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 12 },
  voucherCard: { backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 10, padding: 10 },
  desc: { fontSize: 16, marginBottom: 4 },
  date: { color: '#888', fontSize: 13, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  applyBtn: { backgroundColor: '#28a745', borderRadius: 6, paddingHorizontal: 16, paddingVertical: 6 },
  applyText: { color: '#fff', fontWeight: 'bold' },
  deleteText: { color: 'red', fontWeight: 'bold' },
  closeBtn: { marginTop: 10, alignSelf: 'flex-end' },
  closeText: { color: '#007bff' }
});

export default VoucherListModal; 