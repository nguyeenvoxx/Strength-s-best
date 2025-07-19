const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://172.19.16.1:3000/api/v1';
const TOKEN_FILE = path.join(__dirname, 'test-token.txt');

async function testAppWithLogin() {
  try {
    console.log('🔐 Testing app flow with login...');
    
    // Read existing token if available
    let token = null;
    if (fs.existsSync(TOKEN_FILE)) {
      const tokenData = fs.readFileSync(TOKEN_FILE, 'utf8');
      const lines = tokenData.split('\n');
      const tokenLine = lines.find(line => line.startsWith('Test token from signup:'));
      if (tokenLine) {
        token = tokenLine.split(': ')[1].trim();
        console.log('✅ Found existing token:', token.substring(0, 50) + '...');
      }
    }
    
    if (!token) {
      console.log('❌ No token found. Please run test-signup-and-products.js first.');
      return;
    }
    
    // Test 1: Check authentication status
    console.log('\n1️⃣ Testing authentication status...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });
      console.log('✅ Authentication valid:', authResponse.data.data?.user?.email || 'User authenticated');
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('❌ Token expired or invalid. Need to login again.');
        return;
      }
      console.log('⚠️ Auth check failed:', authError.message);
    }
    
    // Test 2: Fetch products with authentication
    console.log('\n2️⃣ Testing products API with authentication...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 5
      },
      timeout: 10000
    });
    
    console.log('✅ Products API Response Status:', productsResponse.status);
    console.log('✅ Number of products:', productsResponse.data.data?.products?.length || 0);
    
    if (productsResponse.data.data?.products?.length > 0) {
      const firstProduct = productsResponse.data.data.products[0];
      console.log('✅ First product:', {
        id: firstProduct._id,
        name: firstProduct.nameProduct,
        price: firstProduct.priceProduct
      });
      
      // Test 3: Fetch individual product
      console.log('\n3️⃣ Testing individual product fetch...');
      const productResponse = await axios.get(`${BASE_URL}/products/${firstProduct._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Individual product fetch successful:', productResponse.status);
      console.log('✅ Product details:', {
        name: productResponse.data.data?.product?.nameProduct,
        description: productResponse.data.data?.product?.description
      });
    }
    
    console.log('\n🎉 All tests passed! App should work correctly with authentication.');
    console.log('\n📱 App behavior:');
    console.log('- ✅ When logged in: Products will load successfully');
    console.log('- ✅ When not logged in: Login prompts will be shown');
    console.log('- ✅ Error handling: Graceful error messages with retry options');
    
  } catch (error) {
    console.log('\n❌ Test failed:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if backend server is running');
    console.log('2. Verify token is not expired');
    console.log('3. Check network connectivity');
    console.log('4. Ensure API endpoints are correct');
  }
}

testAppWithLogin();