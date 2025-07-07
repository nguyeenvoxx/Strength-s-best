const axios = require('axios');

const BASE_URL = 'http://192.168.100.28:3000/api/v1';

async function testProductsWithoutAuth() {
  try {
    console.log('📦 Testing Products API without authentication...');
    console.log('URL:', `${BASE_URL}/products`);
    
    // Test products API without authentication
    const response = await axios.get(`${BASE_URL}/products`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      params: {
        limit: 10
      }
    });
    
    console.log('✅ Products API Response Status:', response.status);
    console.log('✅ Products API Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n🔐 Authentication required!');
        console.log('This API requires user to be logged in.');
        console.log('The app should handle this by:');
        console.log('1. Redirecting to login screen');
        console.log('2. Showing "Please login to view products" message');
        console.log('3. Providing fallback content or sample data');
      }
    } else if (error.request) {
      console.log('No response received:', error.request);
    }
    
    console.log('\n🔧 Possible solutions:');
    console.log('1. Make products API public (no auth required)');
    console.log('2. Handle 401 errors gracefully in the app');
    console.log('3. Implement guest mode with limited features');
    console.log('4. Show login prompt when accessing products');
  }
}

testProductsWithoutAuth();