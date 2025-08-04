const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.49:3000/api/v1';

async function testCompleteSystem() {
  console.log('🚀 Testing Complete System...\n');
  
  try {
    // Test 1: Kiểm tra API có hoạt động không
    console.log('1. Testing API Connectivity...');
    const healthResponse = await axios.get(`${API_BASE_URL}/products?limit=1`);
    console.log('✅ API is working, Status:', healthResponse.status);
    
    // Test 2: Kiểm tra sản phẩm có discount không
    console.log('\n2. Testing Products with Discount...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=20`);
    const products = productsResponse.data.data.products || [];
    
    const discountedProducts = products.filter(p => p.discount && p.discount > 0);
    console.log(`✅ Found ${discountedProducts.length} products with discount`);
    
    if (discountedProducts.length > 0) {
      console.log('Sample discounted products:');
      discountedProducts.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.nameProduct} - ${p.discount}% off`);
      });
    } else {
      console.log('❌ No products with discount found');
    }
    
    // Test 3: Kiểm tra categories
    console.log('\n3. Testing Categories...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    const categories = categoriesResponse.data.data.categories || [];
    console.log(`✅ Found ${categories.length} categories`);
    
    // Test 4: Kiểm tra brands
    console.log('\n4. Testing Brands...');
    const brandsResponse = await axios.get(`${API_BASE_URL}/brands`);
    const brands = brandsResponse.data.data.brands || [];
    console.log(`✅ Found ${brands.length} brands`);
    
    // Test 5: Kiểm tra related products
    if (products.length > 0) {
      console.log('\n5. Testing Related Products...');
      const firstProduct = products[0];
      const relatedResponse = await axios.get(`${API_BASE_URL}/products/${firstProduct._id}/related?limit=3`);
      const relatedProducts = relatedResponse.data.data.products || [];
      console.log(`✅ Found ${relatedProducts.length} related products for "${firstProduct.nameProduct}"`);
    }
    
    // Test 6: Kiểm tra authentication
    console.log('\n6. Testing Authentication...');
    try {
      const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'testuser@test.com',
        password: 'password123'
      });
      
      if (authResponse.data.status === 'thành công') {
        const token = authResponse.data.data.token;
        console.log('✅ Authentication successful, token received');
        
        // Test 7: Kiểm tra cart với authentication
        console.log('\n7. Testing Cart with Authentication...');
        try {
          const cartResponse = await axios.get(`${API_BASE_URL}/carts`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ Cart API working with authentication');
        } catch (cartError) {
          console.log('⚠️ Cart API error (might be expected if no cart exists):', cartError.response?.status);
        }
      }
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.response?.status);
    }
    
    console.log('\n✅ Complete System Test finished!');
    
  } catch (error) {
    console.error('❌ System Test Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testCompleteSystem().catch(console.error); 