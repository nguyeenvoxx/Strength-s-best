import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CreateAccountSuccessScreen from '../screens/CreateAccountSuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import QRCodePaymentScreen from '../screens/QRCodePaymentScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ title: 'Xác thực email' }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateAccountSuccess" component={CreateAccountSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Quên mật khẩu?' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Health' }} />
        <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Sản phẩm' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ title: 'Thanh toán thành công' }} />
        <Stack.Screen name="QRCodePayment" component={QRCodePaymentScreen} options={{ title: 'Thanh toán QR' }} />
        <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Kiểm tra hàng hóa' }} />
      </Stack.Navigator>
  );
};

export default AppNavigator;