// API Configuration - Local Development
export const API_CONFIG = {
  // Local development - sử dụng localhost
  // Để chạy trên thiết bị thật: thay localhost bằng IP của máy
  // Ví dụ: 'http://192.168.1.100:3000/api/v1'
  BASE_URL: 'http://192.168.1.49:3000/api/v1',
  AUTH_URL: 'http://192.168.1.49:3000/api/v1/auth',
  TIMEOUT: 10000,
};
// export const API_CONFIG = {
//   BASE_URL: 'https://510d21d5ee96.ngrok-free.app/api/v1',
//   AUTH_URL: 'https://510d21d5ee96.ngrok-free.app/api/v1/auth',
//   TIMEOUT: 30000,
// };
// chay may khac thi thay <ngrok-domain> bang ip cua may khac
// Các cấu hình khác
export const APP_CONFIG = {
  APP_NAME: 'Strength Best',
  VERSION: '1.0.0',
};

export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: 'pk_test_51Rw18YKx3BBjq3X2Hgx0TlfAmfABGXeDHIywV1tABCHB9E4XEIPsWxtwzoovdbpRiBEqFKldMqn020U9mrTrzWJS00Vu1Ztklm',
  CURRENCY: 'vnd'
};
