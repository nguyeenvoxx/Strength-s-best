const axios = require('axios');

const BASE_URL = 'http://192.168.1.2:3000/api/v1';

// Test data for signup
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'Test123456',
  passwordConfirm: 'Test123456'
};

async function testSignupAndProducts() {
  try {
    console.log('🔐 Testing Signup API...');
    console.log('URL:', `${BASE_URL}/auth/signup`);
    console.log('Test User:', testUser);
    
    // Test signup
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Signup Response Status:', signupResponse.status);
    console.log('✅ Signup Response Data:', JSON.stringify(signupResponse.data, null, 2));
    
    // Extract token from response
    const token = signupResponse.data.token;
    if (!token) {
      throw new Error('No token received from signup response');
    }
    
    console.log('\n🎫 Token received:', token);
    
    // Save token to file for future reference
    const fs = require('fs');
    const tokenComment = `// Test token from signup: ${token}\n// User: ${testUser.email}\n// Generated at: ${new Date().toISOString()}\n`;
    fs.writeFileSync('scripts/test-token.txt', tokenComment);
    console.log('💾 Token saved to scripts/test-token.txt');
    
    // Now test products API with the token
    console.log('\n📦 Testing Products API with authentication...');
    console.log('URL:', `${BASE_URL}/products`);
    
    const productsResponse = await axios.get(`${BASE_URL}/products`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Products API Response Status:', productsResponse.status);
    console.log('✅ Products API Response Data:', JSON.stringify(productsResponse.data, null, 2));
    
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
    console.log('1. Check if backend server is running on port 3000');
    console.log('2. Verify /auth/signup and /products routes exist in backend');
    console.log('3. Check if MongoDB is connected');
    console.log('4. Verify CORS settings allow frontend requests');
    console.log('5. Check if authentication middleware is properly configured');
  }
}

testSignupAndProducts();