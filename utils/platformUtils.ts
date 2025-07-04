import { Platform, StatusBar } from 'react-native';

/**
 * Get appropriate margin top for Android to avoid status bar overlap
 * @param additionalMargin - Additional margin to add (default: 0)
 * @returns margin top value
 */
export const getAndroidMarginTop = (additionalMargin: number = 0): number => {
  if (Platform.OS === 'android') {
    const statusBarHeight = StatusBar.currentHeight || 24;
    return statusBarHeight + additionalMargin;
  }
  return additionalMargin;
};

/**
 * Get platform-specific styles for container
 * @param additionalMargin - Additional margin to add (default: 0)
 * @returns style object with appropriate marginTop
 */
export const getPlatformContainerStyle = (additionalMargin: number = 0) => ({
  marginTop: getAndroidMarginTop(additionalMargin),
});

/**
 * Check if current platform is Android
 * @returns boolean
 */
export const isAndroid = (): boolean => Platform.OS === 'android';

/**
 * Check if current platform is iOS
 * @returns boolean
 */
export const isIOS = (): boolean => Platform.OS === 'ios';