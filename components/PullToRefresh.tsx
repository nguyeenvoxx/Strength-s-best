import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../store/ThemeContext';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  refreshing = false,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? {
    background: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    accent: '#5CB85C',
  } : {
    background: '#f5f5f5',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#469B43',
  };

  const handleRefresh = async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error('Pull to refresh error:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.background}
        />
      }
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});

export default PullToRefresh;
