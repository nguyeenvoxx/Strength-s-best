const axios = require('axios');

const BASE_URL = 'http://172.16.0.2:3000/api/v1';

async function testProductsAPI() {
  try {
    console.log('Testing Products API...');
    console.log('URL:', `${BASE_URL}/products`);
    
    const response = await axios.get(`${BASE_URL}/products`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ API Error:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.request);
    }
    
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if backend server is running on port 3000');
    console.log('2. Verify /products route exists in backend');
    console.log('3. Check if MongoDB is connected');
    console.log('4. Verify CORS settings allow frontend requests');
  }
}

testProductsAPI();