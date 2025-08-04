const axios = require('axios');

const BASE_URL = 'http://192.168.1.49:3000/api/v1';

async function testConnection() {
  try {
    console.log('🔍 Testing connection to backend...');
    
    // Test 1: Kiểm tra kết nối cơ bản
    console.log('📡 Testing basic connection...');
    const response = await axios.get(`${BASE_URL}/products`, {
      timeout: 30000
    });
    
    console.log('✅ Connection successful!');
    console.log('📊 Response status:', response.status);
    console.log('📦 Products count:', response.data.results);
    
    // Test 2: Kiểm tra với timeout dài hơn
    console.log('\n🔍 Testing with longer timeout...');
    const response2 = await axios.get(`${BASE_URL}/products`, {
      timeout: 60000
    });
    
    console.log('✅ Long timeout test successful!');
    
    // Test 3: Kiểm tra categories
    console.log('\n🔍 Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`, {
      timeout: 30000
    });
    
    console.log('✅ Categories test successful!');
    console.log('📊 Categories count:', categoriesResponse.data.results);
    
  } catch (error) {
    console.error('❌ Connection test failed:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testConnection(); 