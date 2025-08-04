const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.1.49:3000/api/v1';

async function testCartSystem() {
  console.log('🚀 Testing Cart System...\n');

  try {
    // 1. Test Authentication
    console.log('1. Testing Authentication...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Authentication failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received');
      return;
    }

    console.log('✅ Authentication successful\n');

    // 2. Test Get Cart
    console.log('2. Testing Get Cart...');
    const getCartResponse = await fetch(`${API_BASE_URL}/carts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (getCartResponse.ok) {
      const cartData = await getCartResponse.json();
      console.log('✅ Get Cart successful');
      console.log('Cart items count:', cartData.data?.cart?.items?.length || 0);
      console.log('Cart total price:', cartData.data?.cart?.totalPrice || 0);
      
      if (cartData.data?.cart?.items?.length > 0) {
        console.log('Sample item structure:');
        console.log(JSON.stringify(cartData.data.cart.items[0], null, 2));
      }
    } else {
      console.log('❌ Get Cart failed');
      const errorData = await getCartResponse.json();
      console.log('Error:', errorData);
    }
    console.log('');

    // 3. Test Add to Cart
    console.log('3. Testing Add to Cart...');
    const addToCartResponse = await fetch(`${API_BASE_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: '507f1f77bcf86cd799439011', // Test product ID
        quantity: 1
      })
    });

    if (addToCartResponse.ok) {
      const addData = await addToCartResponse.json();
      console.log('✅ Add to Cart successful');
      console.log('Updated cart items count:', addData.data?.cart?.items?.length || 0);
      console.log('Updated cart total price:', addData.data?.cart?.totalPrice || 0);
    } else {
      console.log('❌ Add to Cart failed');
      const errorData = await addToCartResponse.json();
      console.log('Error:', errorData);
    }
    console.log('');

    // 4. Test Remove from Cart
    console.log('4. Testing Remove from Cart...');
    const removeFromCartResponse = await fetch(`${API_BASE_URL}/carts`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: '507f1f77bcf86cd799439011'
      })
    });

    if (removeFromCartResponse.ok) {
      const removeData = await removeFromCartResponse.json();
      console.log('✅ Remove from Cart successful');
      console.log('Updated cart items count:', removeData.data?.cart?.items?.length || 0);
      console.log('Updated cart total price:', removeData.data?.cart?.totalPrice || 0);
    } else {
      console.log('❌ Remove from Cart failed');
      const errorData = await removeFromCartResponse.json();
      console.log('Error:', errorData);
    }
    console.log('');

    // 5. Test Clear Cart
    console.log('5. Testing Clear Cart...');
    const clearCartResponse = await fetch(`${API_BASE_URL}/carts/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (clearCartResponse.ok) {
      const clearData = await clearCartResponse.json();
      console.log('✅ Clear Cart successful');
      console.log('Cart items count after clear:', clearData.data?.cart?.items?.length || 0);
      console.log('Cart total price after clear:', clearData.data?.cart?.totalPrice || 0);
    } else {
      console.log('❌ Clear Cart failed');
      const errorData = await clearCartResponse.json();
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  console.log('\n✅ Cart System Test finished!');
}

testCartSystem(); 

const API_BASE_URL = 'http://192.168.1.49:3000/api/v1';

async function testCartSystem() {
  console.log('🚀 Testing Cart System...\n');

  try {
    // 1. Test Authentication
    console.log('1. Testing Authentication...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Authentication failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.token;
    
    if (!token) {
      console.log('❌ No token received');
      return;
    }

    console.log('✅ Authentication successful\n');

    // 2. Test Get Cart
    console.log('2. Testing Get Cart...');
    const getCartResponse = await fetch(`${API_BASE_URL}/carts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (getCartResponse.ok) {
      const cartData = await getCartResponse.json();
      console.log('✅ Get Cart successful');
      console.log('Cart items count:', cartData.data?.cart?.items?.length || 0);
      console.log('Cart total price:', cartData.data?.cart?.totalPrice || 0);
      
      if (cartData.data?.cart?.items?.length > 0) {
        console.log('Sample item structure:');
        console.log(JSON.stringify(cartData.data.cart.items[0], null, 2));
      }
    } else {
      console.log('❌ Get Cart failed');
      const errorData = await getCartResponse.json();
      console.log('Error:', errorData);
    }
    console.log('');

    // 3. Test Add to Cart
    console.log('3. Testing Add to Cart...');
    const addToCartResponse = await fetch(`${API_BASE_URL}/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: '507f1f77bcf86cd799439011', // Test product ID
        quantity: 1
      })
    });

    if (addToCartResponse.ok) {
      const addData = await addToCartResponse.json();
      console.log('✅ Add to Cart successful');
      console.log('Updated cart items count:', addData.data?.cart?.items?.length || 0);
      console.log('Updated cart total price:', addData.data?.cart?.totalPrice || 0);
    } else {
      console.log('❌ Add to Cart failed');
      const errorData = await addToCartResponse.json();
      console.log('Error:', errorData);
    }
    console.log('');

    // 4. Test Remove from Cart
    console.log('4. Testing Remove from Cart...');
    const removeFromCartResponse = await fetch(`${API_BASE_URL}/carts`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: '507f1f77bcf86cd799439011'
      })
    });

    if (removeFromCartResponse.ok) {
      const removeData = await removeFromCartResponse.json();
      console.log('✅ Remove from Cart successful');
      console.log('Updated cart items count:', removeData.data?.cart?.items?.length || 0);
      console.log('Updated cart total price:', removeData.data?.cart?.totalPrice || 0);
    } else {
      console.log('❌ Remove from Cart failed');
      const errorData = await removeFromCartResponse.json();
      console.log('Error:', errorData);
    }
    console.log('');

    // 5. Test Clear Cart
    console.log('5. Testing Clear Cart...');
    const clearCartResponse = await fetch(`${API_BASE_URL}/carts/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (clearCartResponse.ok) {
      const clearData = await clearCartResponse.json();
      console.log('✅ Clear Cart successful');
      console.log('Cart items count after clear:', clearData.data?.cart?.items?.length || 0);
      console.log('Cart total price after clear:', clearData.data?.cart?.totalPrice || 0);
    } else {
      console.log('❌ Clear Cart failed');
      const errorData = await clearCartResponse.json();
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }

  console.log('\n✅ Cart System Test finished!');
}

testCartSystem(); 