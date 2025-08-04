// Debug script để kiểm tra authentication trong app
const fs = require('fs');
const path = require('path');

async function debugAuth() {
  try {
    console.log('🧪 Debugging Authentication in App...');
    
    // Kiểm tra các file liên quan đến authentication
    console.log('\n1. Checking authentication files...');
    
    const authStorePath = path.join(__dirname, 'store', 'useAuthStore.ts');
    const addressApiPath = path.join(__dirname, 'services', 'addressApi.ts');
    const configPath = path.join(__dirname, 'constants', 'config.ts');
    
    console.log('📋 Auth store exists:', fs.existsSync(authStorePath));
    console.log('📋 Address API exists:', fs.existsSync(addressApiPath));
    console.log('📋 Config exists:', fs.existsSync(configPath));
    
    // Đọc config
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      console.log('📋 API_CONFIG.BASE_URL:', configContent.includes('192.168.1.49') ? 'IP found' : 'IP not found');
    }
    
    // Kiểm tra addressApi
    if (fs.existsSync(addressApiPath)) {
      const addressApiContent = fs.readFileSync(addressApiPath, 'utf8');
      console.log('📋 getUserAddresses function exists:', addressApiContent.includes('getUserAddresses'));
      console.log('📋 Token validation exists:', addressApiContent.includes('useAuthStore.getState().token'));
    }
    
    // Kiểm tra authStore
    if (fs.existsSync(authStorePath)) {
      const authStoreContent = fs.readFileSync(authStorePath, 'utf8');
      console.log('📋 Token field exists:', authStoreContent.includes('token: string'));
      console.log('📋 IsAuthenticated field exists:', authStoreContent.includes('isAuthenticated: boolean'));
    }
    
    console.log('\n2. Common issues to check:');
    console.log('- ✅ User must be logged in');
    console.log('- ✅ Token must be valid');
    console.log('- ✅ API_CONFIG.BASE_URL must be correct');
    console.log('- ✅ Backend server must be running');
    console.log('- ✅ Network connectivity must be working');
    
    console.log('\n3. Debug steps:');
    console.log('1. Check if user is logged in in the app');
    console.log('2. Check console logs for authentication state');
    console.log('3. Check if token exists in AsyncStorage');
    console.log('4. Check if API call is being made');
    console.log('5. Check if server is responding');
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

// Run debug
debugAuth(); 