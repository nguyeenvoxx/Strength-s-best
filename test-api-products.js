const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.49:3000/api/v1';

async function testProductsAPI() {
  console.log('🔍 Testing Products API...');
  
  try {
    // Test 1: Lấy danh sách sản phẩm
    console.log('\n1. Testing GET /products');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=5`);
    console.log('✅ Products Response Status:', productsResponse.status);
    console.log('✅ Products Response Data:', JSON.stringify(productsResponse.data, null, 2));
    
    if (productsResponse.data.data && productsResponse.data.data.products) {
      console.log(`✅ Found ${productsResponse.data.data.products.length} products`);
      
      // Test 2: Lấy chi tiết sản phẩm đầu tiên
      if (productsResponse.data.data.products.length > 0) {
        const firstProduct = productsResponse.data.data.products[0];
        console.log('\n2. Testing GET /products/:id');
        console.log('Testing with product ID:', firstProduct._id);
        
        const productDetailResponse = await axios.get(`${API_BASE_URL}/products/${firstProduct._id}`);
        console.log('✅ Product Detail Response Status:', productDetailResponse.status);
        console.log('✅ Product Detail Response Data:', JSON.stringify(productDetailResponse.data, null, 2));
        
        // Test 3: Lấy sản phẩm liên quan
        console.log('\n3. Testing GET /products/:id/related');
        const relatedResponse = await axios.get(`${API_BASE_URL}/products/${firstProduct._id}/related?limit=3`);
        console.log('✅ Related Products Response Status:', relatedResponse.status);
        console.log('✅ Related Products Response Data:', JSON.stringify(relatedResponse.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing Products API:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

async function testCategoriesAPI() {
  console.log('\n🔍 Testing Categories API...');
  
  try {
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ Categories Response Status:', categoriesResponse.status);
    console.log('✅ Categories Response Data:', JSON.stringify(categoriesResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Error testing Categories API:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

async function testBrandsAPI() {
  console.log('\n🔍 Testing Brands API...');
  
  try {
    const brandsResponse = await axios.get(`${API_BASE_URL}/brands`);
    console.log('✅ Brands Response Status:', brandsResponse.status);
    console.log('✅ Brands Response Data:', JSON.stringify(brandsResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Error testing Brands API:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

async function main() {
  console.log('🚀 Starting API Tests...\n');
  
  await testProductsAPI();
  await testCategoriesAPI();
  await testBrandsAPI();
  
  console.log('\n✅ API Tests completed!');
}

main().catch(console.error); 