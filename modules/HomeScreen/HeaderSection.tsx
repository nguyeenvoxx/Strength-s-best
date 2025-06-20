import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderSectionProps {
  title: string;
  remainingTime: string;
  color: string;
  onViewAll?: () => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ title, remainingTime, color, onViewAll }) => (
  <View style={[styles.sectionHeader, { backgroundColor: color }]}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={12} color="#FFFFFF" />
        <Text style={styles.timerText}>{remainingTime}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
      <Text style={styles.viewAllText}>Xem tất cả</Text>
      <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  sectionHeader: {
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    marginVertical: 16
  },
  sectionTitleContainer: {
    alignItems: 'center',
    gap: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 2,
  },
});

export default HeaderSection;
