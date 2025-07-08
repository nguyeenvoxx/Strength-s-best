// API Configuration
export const API_CONFIG = {
  // IP Address được tự động detect: 172.16.0.2
  // Để tìm IP thủ công: mở Command Prompt và chạy 'ipconfig'
  // Hoặc sử dụng 10.0.2.2 cho Android Emulator
  // Hoặc sử dụng localhost cho iOS Simulator
  BASE_URL: 'http://192.168.100.28:3000/api/v1',
  AUTH_URL: 'http://192.168.100.28:3000/api/v1/auth',
  TIMEOUT: 10000,
};

// Các cấu hình khác
export const APP_CONFIG = {
  APP_NAME: 'Strength Best',
  VERSION: '1.0.0',
};
