import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export const TokenExpiredModal: React.FC = () => {
  const { showTokenExpiredModal, hideTokenExpiredModal, logout } = useAuthStore();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const handleLogin = () => {
    hideTokenExpiredModal();
    logout();
    router.replace('/(auth)/sign-in' as any);
  };

  const handleClose = () => {
    hideTokenExpiredModal();
    logout();
    router.replace('/(auth)/sign-in' as any);
  };

  return (
    <Modal
      visible={showTokenExpiredModal === true}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="time-outline" size={48} color={colors.accent} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Phiên đăng nhập đã hết hạn
          </Text>

          {/* Message */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Phiên đăng nhập của bạn đã hết hạn sau 30 phút không hoạt động. Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.accent }]}
              onPress={handleLogin}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" />
              <Text style={styles.loginButtonText}>
                Đăng nhập lại
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
