const axios = require('axios');

const BASE_URL = 'http:// 192.168.1.138:3000/api/v1';

// Token from previous signup test
// Test token from signup: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjgyYmQ3NTE3ZjlmNDljYmRjMDk2YyIsImlhdCI6MTc1MTY1NzQzMiwiZXhwIjoxNzU5NDMzNDMyfQ.5gy5YVLgWd3NtFsB2B7FUz6mSqenEraBlulUvdaJ1Tg
// User: testuser@example.com
// Generated at: 2025-07-04T19:30:32.131Z
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjgyYmQ3NTE3ZjlmNDljYmRjMDk2YyIsImlhdCI6MTc1MTY1NzQzMiwiZXhwIjoxNzU5NDMzNDMyfQ.5gy5YVLgWd3NtFsB2B7FUz6mSqenEraBlulUvdaJ1Tg';

async function testProductsWithToken() {
  try {
    console.log('📦 Testing Products API with authentication token...');
    console.log('URL:', `${BASE_URL}/products`);
    console.log('Token:', TEST_TOKEN.substring(0, 50) + '...');
    
    // Test products API with authentication
    const response = await axios.get(`${BASE_URL}/products`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      params: {
        limit: 10
      }
    });
    
    console.log('✅ Products API Response Status:', response.status);
    console.log('✅ Products API Response Data:', JSON.stringify(response.data, null, 2));
    
    // Test individual product fetch
    if (response.data.data && response.data.data.products && response.data.data.products.length > 0) {
      const firstProductId = response.data.data.products[0]._id;
      console.log('\n🔍 Testing individual product fetch...');
      console.log('Product ID:', firstProductId);
      
      const productResponse = await axios.get(`${BASE_URL}/products/${firstProductId}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('✅ Individual Product Response Status:', productResponse.status);
      console.log('✅ Individual Product Response Data:', JSON.stringify(productResponse.data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    }
    
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if token is still valid (not expired)');
    console.log('2. Verify authentication middleware in backend');
    console.log('3. Check if user has permission to access products');
    console.log('4. Ensure backend server is running properly');
  }
}

testProductsWithToken();