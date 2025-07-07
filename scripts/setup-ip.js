const os = require('os');
const fs = require('fs');
const path = require('path');

// Hàm để lấy IP address của máy host
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Bỏ qua loopback và non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost'; // fallback
}

// Tạo nội dung config file
function generateConfigContent(ipAddress) {
  return `// API Configuration
export const API_CONFIG = {
  // IP Address được tự động detect: ${ipAddress}
  // Để tìm IP thủ công: mở Command Prompt và chạy 'ipconfig'
  // Hoặc sử dụng 10.0.2.2 cho Android Emulator
  // Hoặc sử dụng localhost cho iOS Simulator
  BASE_URL: 'http://${ipAddress}:3000/api/v1',
  AUTH_URL: 'http://${ipAddress}:3000/api/v1/auth',
  TIMEOUT: 10000,
};

// Các cấu hình khác
export const APP_CONFIG = {
  APP_NAME: 'Strength Best',
  VERSION: '1.0.0',
};
`;
}

// Main function
function setupIP() {
  try {
    const ipAddress = getLocalIPAddress();
    console.log(`Detected IP Address: ${ipAddress}`);
    
    const configPath = path.join(__dirname, '..', 'constants', 'config.ts');
    const configContent = generateConfigContent(ipAddress);
    
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log(`Config file updated successfully at: ${configPath}`);
    console.log('Please restart your React Native app to apply changes.');
    
  } catch (error) {
    console.error('Error setting up IP:', error);
  }
}

setupIP();