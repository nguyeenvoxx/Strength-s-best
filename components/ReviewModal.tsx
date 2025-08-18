import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../store/ThemeContext';
import { LightColors, DarkColors } from '../constants/Colors';
import { createReview, CreateReviewRequest } from '../services/reviewApi';
import { useAuthStore } from '../store/useAuthStore';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  product: {
    _id: string;
    nameProduct: string;
    image?: string;
  };
  orderDetailId: string;
  onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  product,
  orderDetailId,
  onReviewSubmitted
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const { token } = useAuthStore();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      
      const reviewData: CreateReviewRequest = {
        idProduct: product._id,
        idOrderDetail: orderDetailId,
        rating,
        review: review.trim() || undefined
      };

      await createReview(token, reviewData);
      
      Alert.alert(
        'Thành công', 
        'Đánh giá của bạn đã được gửi! +5 điểm',
        [
          { text: 'Ở lại', style: 'cancel', onPress: onClose },
          { 
            text: 'Xem đánh giá', 
            onPress: () => {
              // Điều hướng tới trang chi tiết sản phẩm và cuộn tới phần đánh giá
              router.replace({
                pathname: `/product/${product._id}` as any,
                params: { scrollTo: 'reviews' }
              });
            }
          }
        ]
      );
      
      // Reset form
      setRating(0);
      setReview('');
      
      // Callback để refresh data
      onReviewSubmitted?.();
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Nếu lỗi là "đã đánh giá rồi", tự động cập nhật state
      if (error.message && error.message.includes('đã đánh giá')) {
        Alert.alert('Thông báo', 'Bạn đã đánh giá sản phẩm này rồi');
        // Gọi callback để cập nhật state
        onReviewSubmitted?.();
      } else {
        Alert.alert('Thông báo', error.message || 'Không thể gửi đánh giá');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    
    if (rating > 0 || review.trim()) {
      Alert.alert(
        'Hủy đánh giá',
        'Bạn có chắc muốn hủy đánh giá này?',
        [
          { text: 'Tiếp tục đánh giá', style: 'cancel' },
          { 
            text: 'Hủy', 
            style: 'destructive',
            onPress: () => {
              setRating(0);
              setReview('');
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Đánh giá sản phẩm
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: colors.text }]}>
                {product.nameProduct}
              </Text>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingContainer}>
              <Text style={[styles.ratingLabel, { color: colors.text }]}>
                Chọn số sao đánh giá:
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32}
                      color={star <= rating ? "#FFD700" : colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {rating > 0 ? `${rating} sao` : 'Chưa chọn'}
              </Text>
            </View>

            {/* Review Text */}
            <View style={styles.reviewContainer}>
              <Text style={[styles.reviewLabel, { color: colors.text }]}>
                Nhận xét của bạn (không bắt buộc):
              </Text>
              <TextInput
                style={[styles.reviewInput, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                placeholderTextColor={colors.textSecondary}
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                {review.length}/1000 ký tự
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Hủy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton, 
                { 
                  backgroundColor: rating > 0 ? colors.accent : colors.textSecondary,
                  opacity: submitting ? 0.6 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Gửi đánh giá
                </Text>
              )}
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  productInfo: {
    marginBottom: 20,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 14,
  },
  reviewContainer: {
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewModal;




