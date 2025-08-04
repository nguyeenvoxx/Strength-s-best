const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Cấu hình để cho phép kết nối network
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Cấu hình network
config.server = {
  ...config.server,
  port: 8081,
  host: '0.0.0.0',
};

module.exports = config; 