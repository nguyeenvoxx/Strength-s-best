// Test URL generation manually
const baseUrl = 'http://192.168.1.49:3000';

function getProductImageUrl(imagePath) {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }
  
  // Nếu là URL đầy đủ
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu là tên file, sử dụng static file serving
  if (imagePath.includes('.jpg') || imagePath.includes('.png') || imagePath.includes('.jpeg')) {
    const fullUrl = `${baseUrl}/uploads/products/${imagePath}`;
    return fullUrl;
  }
  
  // Fallback
  return 'https://via.placeholder.com/300x300?text=Product+Image';
}

// Test data
const testProducts = [
  { image: 'biotin.png' },
  { image: 'vitamine.png' },
  { image: 'whey_protein.jpg' },
  { image: 'vitamin_c.jpg' },
  { image: null },
  { image: 'https://example.com/image.jpg' }
];

console.log('🔍 Testing image URL generation:');
console.log('================================');

testProducts.forEach((product, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log('Input:', product.image);
  console.log('Output:', getProductImageUrl(product.image));
});

console.log('\n🔍 Testing direct URL access:');
console.log('================================');
console.log('biotin.png URL:', `${baseUrl}/uploads/products/biotin.png`);
console.log('vitamine.png URL:', `${baseUrl}/uploads/products/vitamine.png`); 