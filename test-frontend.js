const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testFrontend() {
  try {
    console.log('🔍 Test frontend API calls...');
    
    // Test 1: Đăng nhập
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Test 2: Tạo thanh toán từ giỏ hàng (như frontend)
    const paymentData = {
      typePayment: 'cod',
      items: [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Test Product',
          price: 100000,
          quantity: 1,
          image: 'test.jpg'
        }
      ],
      shippingInfo: {
        fullName: 'Test User',
        phone: '0123456789',
        address: '123 Test Street'
      }
    };

    console.log('🔍 Test createPaymentFromCart...');
    const paymentResponse = await axios.post(
      `${BASE_URL}/payments/from-cart`,
      paymentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Frontend API test successful:', paymentResponse.data);
  } catch (error) {
    console.error('❌ Frontend API test failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testFrontend(); 