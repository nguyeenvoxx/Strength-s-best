const axios = require('axios');
const fs = require('fs');

// Đọc token từ file
let token = '';
try {
  token = fs.readFileSync('./scripts/test-token.txt', 'utf8').trim();
  console.log('✅ Token đã được đọc thành công');
} catch (error) {
  console.log('❌ Không thể đọc token:', error.message);
  process.exit(1);
}

const API_BASE_URL = 'http:// 192.168.1.138:3000/api';

async function testNavigationFlow() {
  console.log('🔍 Kiểm tra luồng điều hướng từ Home đến Product Detail...');
  
  try {
    // 1. Test API danh sách sản phẩm (mô phỏng màn hình Home)
    console.log('\n📋 Bước 1: Lấy danh sách sản phẩm từ API...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 5
      }
    });
    
    if (productsResponse.data && productsResponse.data.data) {
      const products = productsResponse.data.data;
      console.log(`✅ Lấy được ${products.length} sản phẩm`);
      
      // 2. Kiểm tra từng sản phẩm có thể điều hướng được không
      console.log('\n🔗 Bước 2: Kiểm tra điều hướng đến chi tiết sản phẩm...');
      
      for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];
        const productId = product.id;
        
        console.log(`\n📦 Kiểm tra sản phẩm: ${product.title || 'Không có tên'} (ID: ${productId})`);
        
        try {
          // Mô phỏng việc nhấn vào sản phẩm -> gọi API chi tiết
          const detailResponse = await axios.get(`${API_BASE_URL}/products/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (detailResponse.data && detailResponse.data.data) {
            console.log(`  ✅ Điều hướng thành công đến /product/${productId}`);
            console.log(`  📝 Tên sản phẩm: ${detailResponse.data.data.title || 'Không có tên'}`);
            console.log(`  💰 Giá: ${detailResponse.data.data.price || 'Không có giá'}`);
          } else {
            console.log(`  ❌ Không có dữ liệu chi tiết cho sản phẩm ${productId}`);
          }
        } catch (detailError) {
          console.log(`  ❌ Lỗi khi lấy chi tiết sản phẩm ${productId}:`, detailError.response?.data?.message || detailError.message);
        }
      }
      
    } else {
      console.log('❌ Không có dữ liệu sản phẩm');
    }
    
  } catch (error) {
    console.log('❌ Lỗi khi kiểm tra luồng điều hướng:', error.response?.data?.message || error.message);
  }
}

// Kiểm tra các vấn đề có thể gây ra lỗi điều hướng
function checkNavigationIssues() {
  console.log('\n🔧 Kiểm tra các vấn đề có thể gây lỗi điều hướng:');
  
  const issues = [
    '1. TouchableOpacity không có onPress handler',
    '2. router.push() bị lỗi do route không tồn tại', 
    '3. Product ID không hợp lệ hoặc undefined',
    '4. Component bị re-render liên tục',
    '5. Lỗi JavaScript trong quá trình render',
    '6. Xung đột giữa các gesture handler',
    '7. Vấn đề với navigation state'
  ];
  
  issues.forEach(issue => {
    console.log(`  📌 ${issue}`);
  });
  
  console.log('\n💡 Gợi ý debug:');
  console.log('  - Kiểm tra console log trong Metro bundler');
  console.log('  - Thêm console.log vào onPress handler');
  console.log('  - Kiểm tra product.id có giá trị hợp lệ');
  console.log('  - Đảm bảo route /product/[id] được định nghĩa đúng');
}

async function main() {
  console.log('🚀 Bắt đầu kiểm tra điều hướng...');
  
  await testNavigationFlow();
  checkNavigationIssues();
  
  console.log('\n✅ Hoàn thành kiểm tra!');
}

main().catch(console.error);