const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ưu tiên field main để dùng bản build sẵn của lib thay vì src TS trong node_modules
config.resolver.resolverMainFields = ['main', 'module', 'react-native', 'browser'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Cấu hình network
config.server = {
  ...config.server,
  port: 8081,
  host: '0.0.0.0',
};

module.exports = config; 