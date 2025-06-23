// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { Alert } from 'react-native';

// const PurchasedOrdersScreen: React.FC = () => {
//   const [orders, setOrders] = useState<any[]>([]);
//   const router = useRouter();

//   const handleCancel = async (orderId: string) => {
//     const updated = orders.filter(order => order.id !== orderId);
//     setOrders(updated);
//     await AsyncStorage.setItem('purchased', JSON.stringify(updated));
//   };
//   useEffect(() => {
//     const fetchOrders = async () => {
//       // await AsyncStorage.removeItem('purchased'); // Xoá dữ liệu cũ nếu cần thiết
//       const data = await AsyncStorage.getItem('purchased');
//       if (data) setOrders(JSON.parse(data));
//     };
//     fetchOrders();
//   }, []);
//   // Format price to Vietnamese currency
//   const formatPrice = (value: any) => {
//     const number = typeof value === 'string' ? parseInt(value.replace(/\./g, '')) : value;
//     if (isNaN(number)) return '0 đ';
//     return number.toLocaleString('vi-VN') + ' đ';
//   };

//   if (orders.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Đơn hàng đã mua</Text>

//       {orders.map((order) => (
//         <View key={order.id} style={styles.card}>
//           <Text style={styles.orderId}>Mã đơn: {order.id}</Text>
//           <Text style={styles.orderDate}>
//             Ngày: {new Date(order.date).toLocaleDateString('vi-VN')}
//           </Text>
//           {order.voucher && (
//             <Text style={styles.voucherText}>Mã giảm giá: {order.voucher.code}</Text>
//           )}

//           {Array.isArray(order.items) &&
//             order.items.map((item: any) => (
//               <View key={item.id} style={styles.product}>
//                 <Image
//                   source={typeof item.image === 'number' ? item.image : { uri: item.image }}
//                   style={styles.image}
//                 />
//                 <View style={{ flex: 1, marginLeft: 12 }}>
//                   <Text style={styles.name}>{item.name}</Text>
//                   <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
//                   <Text style={styles.price}>{formatPrice(item.price)}</Text>
//                 </View>
//               </View>
//             ))}
//           <Text style={styles.total}>
//             Tổng thanh toán: {formatPrice(order.total)}
//           </Text>

//           <TouchableOpacity
//             style={styles.cancelButton}
//             onPress={() => handleCancel(order.id)}
//           >
//             <Text style={styles.cancelText}>Huỷ đơn</Text>
//           </TouchableOpacity>
//         </View>
//       ))}
//       <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/home')}>
//         <Text style={styles.buttonText}>Tiếp tục mua sắm</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   orderId: { fontWeight: 'bold' },
//   orderDate: { color: '#666', marginBottom: 6 },
//   voucherText: { color: '#28a745', fontSize: 14, marginBottom: 4 },
//   total: { fontSize: 16, fontWeight: 'bold', marginTop: 12, color: '#007bff' },
//   product: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//     borderBottomWidth: 1,
//     borderColor: '#ccc',
//   },
//   cancelButton: {
//     marginTop: 10,
//     backgroundColor: '#dc3545',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     alignSelf: 'flex-start',
//   },
//   cancelText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   card: {
//     flexDirection: 'row',
//     backgroundColor: '#f9f9f9',
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 6,
//     backgroundColor: '#eee',
//   },
//   info: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   name: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   quantity: {
//     fontSize: 13,
//     color: '#555',
//   },
//   price: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#007bff',
//   },
//   button: {
//     backgroundColor: '#28a745',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 30,
//     marginBottom: 50,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 100,
//     backgroundColor: '#fff',
//   },
//   emptyText: {
//     fontSize: 18,
//     color: '#666',
//   },
// });

// export default PurchasedOrdersScreen;
