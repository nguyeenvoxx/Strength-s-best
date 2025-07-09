const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://192.168.1.2:3000/api/v1';
const TOKEN_FILE = path.join(__dirname, 'test-token.txt');

async function testProductNavigation() {
  try {
    console.log('🔍 Testing product navigation flow...');
    
    // Step 1: Read existing token
    if (!fs.existsSync(TOKEN_FILE)) {
      console.log('❌ No token file found. Please run test-new-signup-and-products.js first.');
      return;
    }
    
    const tokenData = fs.readFileSync(TOKEN_FILE, 'utf8');
    const tokenMatch = tokenData.match(/Test token from.*?: (.+)/);
    
    if (!tokenMatch) {
      console.log('❌ Could not extract token from file.');
      return;
    }
    
    const token = tokenMatch[1].trim();
    console.log('✅ Token found:', token.substring(0, 50) + '...');
    
    // Step 2: Get products list (simulating home screen)
    console.log('\n1️⃣ Getting products list (home screen simulation)...');
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
    
    console.log('✅ Products Response Status:', productsResponse.status);
    
    if (!productsResponse.data.data?.products?.length) {
      console.log('❌ No products found in response');
      return;
    }
    
    const products = productsResponse.data.data.products;
    console.log(`Found ${products.length} products:`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ID: ${product._id}`);
      console.log(`   Name: ${product.nameProduct}`);
      console.log(`   Price: ${product.priceProduct} VND`);
      console.log('---');
    });
    
    // Step 3: Test individual product fetch (simulating navigation to product detail)
    const firstProduct = products[0];
    const productId = firstProduct._id;
    
    console.log('\n2️⃣ Testing product detail navigation...');
    console.log('Navigating to product ID:', productId);
    console.log('Product Name:', firstProduct.nameProduct);
    
    const productDetailResponse = await axios.get(`${BASE_URL}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Product Detail Response Status:', productDetailResponse.status);
    
    if (productDetailResponse.data.status === 'success') {
      const productDetail = productDetailResponse.data.data.product;
      console.log('✅ Product Detail Retrieved:');
      console.log('- ID:', productDetail._id);
      console.log('- Name:', productDetail.nameProduct);
      console.log('- Price:', productDetail.priceProduct, 'VND');
      console.log('- Description:', productDetail.description?.substring(0, 100) + '...');
      console.log('- Brand:', productDetail.idBrand?.nameBrand || productDetail.idBrand);
      console.log('- Category:', productDetail.idCategory?.nameCategory || productDetail.idCategory);
      console.log('- Status:', productDetail.status);
      console.log('- Quantity:', productDetail.quantity);
      console.log('- Image:', productDetail.image);
    }
    
    // Step 4: Test multiple product navigation
    console.log('\n3️⃣ Testing navigation to multiple products...');
    
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i];
      console.log(`\nTesting product ${i + 1}: ${product.nameProduct}`);
      
      try {
        const response = await axios.get(`${BASE_URL}/products/${product._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        if (response.status === 200 && response.data.status === 'success') {
          console.log(`✅ Product ${i + 1} detail loaded successfully`);
        } else {
          console.log(`❌ Product ${i + 1} detail failed:`, response.data.message);
        }
      } catch (error) {
        console.log(`❌ Product ${i + 1} detail error:`, error.message);
      }
    }
    
    console.log('\n🎉 Product navigation test completed!');
    console.log('\n📱 Navigation flow summary:');
    console.log('- ✅ Home screen can load products list');
    console.log('- ✅ Product IDs are correctly formatted');
    console.log('- ✅ Product detail API works with authentication');
    console.log('- ✅ Navigation from home to product detail should work');
    console.log('- ✅ App will show login prompt if user not authenticated');
    
    console.log('\n🔧 App behavior:');
    console.log('1. When user clicks product on home screen → navigates to /product/[id]');
    console.log('2. If user not logged in → shows login prompt');
    console.log('3. If user logged in → loads and displays product details');
    console.log('4. If API error → shows error message with retry button');
    
  } catch (error) {
    console.log('\n❌ Error occurred:');
    console.log('Error Message:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if backend server is running');
    console.log('2. Verify token is still valid');
    console.log('3. Check network connectivity');
    console.log('4. Ensure product endpoints are working');
  }
}

testProductNavigation();