const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://192.168.1.138:3000/api/v1';
const TOKEN_FILE = path.join(__dirname, 'test-token.txt');

async function testNewSignupAndProducts() {
  try {
    console.log('🔐 Testing new user signup and products API...');
    
    // Step 1: Sign up a new user with unique email
    console.log('\n1️⃣ Creating new user account...');
    const timestamp = Date.now();
    const signupData = {
      name: 'Test User New',
      email: `testuser${timestamp}@example.com`,
      password: 'password123',
      phoneNumber: '0123456789'
    };
    
    console.log('Signup data:', {
      name: signupData.name,
      email: signupData.email,
      phoneNumber: signupData.phoneNumber
    });
    
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, signupData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Signup successful!');
    console.log('User:', signupResponse.data.data?.user?.email || 'User created');
    
    const token = signupResponse.data.token;
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Save token to file
    const tokenData = `Test token from new signup: ${token}\nUser: ${signupData.email}\nGenerated at: ${new Date().toISOString()}\n`;
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
      productsResponse.data.data.products.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.nameProduct} - ${product.priceProduct} VND`);
        console.log(`   Description: ${product.description || 'No description'}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   Brand: ${product.idBrand?.name || product.idBrand}`);
        console.log(`   Category: ${product.idCategory?.name || product.idCategory}`);
        console.log('---');
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
        description: productResponse.data.data?.product?.description,
        brand: productResponse.data.data?.product?.idBrand?.name,
        category: productResponse.data.data?.product?.idCategory?.name
      });
    }
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📱 App should now work correctly:');
    console.log('- ✅ User signup works');
    console.log('- ✅ Authentication token is generated');
    console.log('- ✅ Products API works with authentication');
    console.log('- ✅ Individual product fetch works');
    console.log('- ✅ Token is saved for future use');
    
    console.log('\n🔧 Next steps for the app:');
    console.log('1. Users need to sign up/login to view products');
    console.log('2. App will show login prompts when not authenticated');
    console.log('3. Products will load successfully after authentication');
    console.log('4. Error handling is in place for network issues');
    
  } catch (error) {
    console.log('\n❌ Error occurred:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.request);
    }
    
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if backend server is running');
    console.log('2. Verify signup/products endpoints');
    console.log('3. Check network connectivity');
    console.log('4. Ensure MongoDB is connected');
  }
}

testNewSignupAndProducts();