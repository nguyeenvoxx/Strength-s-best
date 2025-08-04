const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.49:3000/api/v1';

async function testCartAPI() {
  console.log('🧪 Testing Cart API...\n');
  
  try {
    // 1. Login để lấy token
    console.log('1. Logging in...');
    const authResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'testuser@test.com',
      password: 'password123'
    });
    
    if (authResponse.data.status === 'thành công') {
      const token = authResponse.data.data.token;
      console.log('✅ Login successful');
      
      // 2. Test GET /carts
      console.log('\n2. Testing GET /carts...');
      try {
        const cartResponse = await axios.get(`${API_BASE_URL}/carts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ GET /carts successful');
        console.log('Cart data:', JSON.stringify(cartResponse.data, null, 2));
      } catch (cartError) {
        console.log('❌ GET /carts failed');
        console.log('Status:', cartError.response?.status);
        console.log('Error:', cartError.response?.data);
      }
      
      // 3. Test POST /carts (add to cart)
      console.log('\n3. Testing POST /carts...');
      try {
        // Lấy danh sách sản phẩm trước
        const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=1`);
        const firstProduct = productsResponse.data.data.products[0];
        
        if (firstProduct) {
          const addToCartResponse = await axios.post(`${API_BASE_URL}/carts`, {
            idProduct: firstProduct._id,
            quantity: 1
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ POST /carts successful');
          console.log('Add to cart response:', JSON.stringify(addToCartResponse.data, null, 2));
        } else {
          console.log('⚠️ No products available to test add to cart');
        }
      } catch (addToCartError) {
        console.log('❌ POST /carts failed');
        console.log('Status:', addToCartError.response?.status);
        console.log('Error:', addToCartError.response?.data);
      }
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testCartAPI().catch(console.error); 