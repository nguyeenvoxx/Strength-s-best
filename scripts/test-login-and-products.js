const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http:/172.19.16.1:3000/api/v1'; 
const TOKEN_FILE = path.join(__dirname, 'test-token.txt');

async function testLoginAndProducts() {
  try {
    console.log('🔐 Testing login and products API...');
    
    // Step 1: Login with existing user
    console.log('\n1️⃣ Logging in with existing user...');
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data?.user?.email || 'User logged in');
    
    const token = loginResponse.data.token;
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Save token to file
    const tokenData = `Test token from login: ${token}\nUser: ${loginData.email}\nGenerated at: ${new Date().toISOString()}\n`;
    fs.writeFileSync(TOKEN_FILE, tokenData);
    console.log('✅ Token saved to file');
    
    // Step 2: Test products API with token
    console.log('\n2️⃣ Testing products API with authentication...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 10
      },
      timeout: 10000
    });
    
    console.log('✅ Products API Response Status:', productsResponse.status);
    console.log('✅ Products API Response Data:');
    
    if (productsResponse.data.data?.products) {
      console.log(`Found ${productsResponse.data.data.products.length} products:`);
      productsResponse.data.data.products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.nameProduct} - ${product.priceProduct} VND`);
      });
    }
    
    // Step 3: Test individual product fetch
    if (productsResponse.data.data?.products?.length > 0) {
      const firstProductId = productsResponse.data.data.products[0]._id;
      console.log('\n3️⃣ Testing individual product fetch...');
      console.log('Product ID:', firstProductId);
      
      const productResponse = await axios.get(`${BASE_URL}/products/${firstProductId}`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Individual Product Response Status:', productResponse.status);
      console.log('✅ Product Details:', {
        name: productResponse.data.data?.product?.nameProduct,
        price: productResponse.data.data?.product?.priceProduct,
        description: productResponse.data.data?.product?.description
      });
    }
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📱 App should now work correctly:');
    console.log('- ✅ Login functionality works');
    console.log('- ✅ Products API works with authentication');
    console.log('- ✅ Individual product fetch works');
    console.log('- ✅ Token is saved for future use');
    
  } catch (error) {
    console.log('\n❌ Error occurred:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log('\n🔐 Authentication failed!');
        console.log('Possible reasons:');
        console.log('1. Wrong email or password');
        console.log('2. User account not found');
        console.log('3. Account not verified');
      }
    } else if (error.request) {
      console.log('No response received:', error.request);
    }
    
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if backend server is running');
    console.log('2. Verify login credentials');
    console.log('3. Check network connectivity');
    console.log('4. Ensure authentication endpoints are working');
  }
}

testLoginAndProducts();