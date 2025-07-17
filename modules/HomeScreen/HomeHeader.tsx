import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface HomeHeaderProps {
  onMenuPress?: () => void;
  onUserPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  onLogoutPress?: () => void;
  onCartPress?: () => void;
  onFavoritesPress?: () => void;
  user?: User | null;
  isAuthenticated?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  onMenuPress, 
  onUserPress, 
  onProfilePress,
  onSettingsPress,
  onLogoutPress,
  onCartPress,
  onFavoritesPress,
  user, 
  isAuthenticated 
}) => {
  const [showMenuModal, setShowMenuModal] = useState(false);

  const handleMenuPress = () => {
    setShowMenuModal(true);
  };

  const handleCloseModal = () => {
    setShowMenuModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Menu Icon */}        
        <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* User Info */}
        <TouchableOpacity style={styles.userContainer} onPress={onUserPress}>
          {isAuthenticated && user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Xin chào</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {isAuthenticated && user ? user.name : 'Khách'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenuModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Drag Handle */}
                <View style={styles.dragHandle}>
                  <View style={styles.dragIndicator} />
                </View>
                
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Menu</Text>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                                  <View style={styles.menuItems}>
                    {/* User Info Section */}
                    <View style={styles.userSection}>
                      {isAuthenticated && user?.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} style={styles.modalAvatar} />
                      ) : (
                        <View style={styles.modalAvatarPlaceholder}>
                          <Ionicons name="person" size={24} color="#666" />
                        </View>
                      )}
                      <View style={styles.modalUserInfo}>
                        <Text style={styles.modalUserName}>
                          {isAuthenticated && user ? user.name : 'Khách'}
                        </Text>
                        <Text style={styles.modalUserEmail}>
                          {isAuthenticated && user ? user.email : 'Đăng nhập để sử dụng đầy đủ tính năng'}
                        </Text>
                        {isAuthenticated && (
                          <View style={styles.userStats}>
                            <View style={styles.statItem}>
                              <Text style={styles.statNumber}>12</Text>
                              <Text style={styles.statLabel}>Đơn hàng</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                              <Text style={styles.statNumber}>5</Text>
                              <Text style={styles.statLabel}>Yêu thích</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                              <Text style={styles.statNumber}>3</Text>
                              <Text style={styles.statLabel}>Đánh giá</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>

                  {/* Menu Options */}
                  <View style={styles.menuOptions}>
                    {isAuthenticated ? (
                      <>
                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            onProfilePress?.();
                          }}
                        >
                          <Ionicons name="person-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Hồ sơ cá nhân</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            onCartPress?.();
                          }}
                        >
                          <Ionicons name="cart-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Giỏ hàng</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            onFavoritesPress?.();
                          }}
                        >
                          <Ionicons name="heart-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Sản phẩm yêu thích</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            onSettingsPress?.();
                          }}
                        >
                          <Ionicons name="settings-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Cài đặt</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            // Add notification press handler
                          }}
                        >
                          <Ionicons name="notifications-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Thông báo</Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>3</Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            // Add help press handler
                          }}
                        >
                          <Ionicons name="help-circle-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Trợ giúp</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => {
                            handleCloseModal();
                            // Add about press handler
                          }}
                        >
                          <Ionicons name="information-circle-outline" size={24} color="#469B43" />
                          <Text style={styles.menuItemText}>Về chúng tôi</Text>
                          <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity 
                          style={[styles.menuItem, styles.logoutItem]} 
                          onPress={() => {
                            handleCloseModal();
                            onLogoutPress?.();
                          }}
                        >
                          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
                          <Text style={[styles.menuItemText, styles.logoutText]}>Đăng xuất</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => {
                          handleCloseModal();
                          onUserPress?.();
                        }}
                      >
                        <Ionicons name="log-in-outline" size={24} color="#469B43" />
                        <Text style={styles.menuItemText}>Đăng nhập</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logo: {
    height: 32,
    maxWidth: 120,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 120,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItems: {
    flex: 1,
    paddingBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  modalAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  modalUserEmail: {
    fontSize: 12,
    color: '#666',
  },
  menuOptions: {
    flex: 1,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutItem: {
    backgroundColor: '#fff5f5',
  },
  logoutText: {
    color: '#ff4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  badge: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#469B43',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 5,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
});

export default HomeHeader;