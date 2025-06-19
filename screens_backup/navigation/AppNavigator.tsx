import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../SplashScreen';
import SignInScreen from '../SignInScreen';
import SignUpScreen from '../SignUpScreen';
import EmailVerificationScreen from '../EmailVerificationScreen';
import WelcomeScreen from '../WelcomeScreen';
import CreateAccountSuccessScreen from '../CreateAccountSuccessScreen';
import ForgotPasswordScreen from '../ForgotPasswordScreen';
import HomeScreen from '../HomeScreen';
import ProductScreen from '../ProductScreen';
import ProfileScreen from '../ProfileScreen';
import CartScreen from '../CartScreen';
import CheckoutScreen from '../CheckoutScreen';
import PaymentSuccessScreen from '../PaymentSuccessScreen';
import QRCodePaymentScreen from '../QRCodePaymentScreen';
import OrderSummaryScreen from '../OrderSummaryScreen';

import EditProfileScreen from '../EditProfileScreen';

import SearchBar from '../../components/text-input/SearchBar';
import SearchScreen from '@/screens_backup/SearchScreen';


const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  return (
      <Stack.Navigator initialRouteName="Splash">
        // Auth route
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ title: 'Xác thực email' }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateAccountSuccess" component={CreateAccountSuccessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Quên mật khẩu?' }} />


        //bottom tab 
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Health' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} options={{ title: 'Hồ sơ' }} />

        // other route
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Chinh sua thong tin' }} />
        <Stack.Screen name="Product" component={ProductScreen} options={{ title: 'Sản phẩm' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Thanh toán' }} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ title: 'Thanh toán thành công' }} />
        <Stack.Screen name="QRCodePayment" component={QRCodePaymentScreen} options={{ title: 'Thanh toán QR' }} />
        <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Kiểm tra hàng hóa' }} />
        <Stack.Screen name="ProductDetailScreen" component={OrderSummaryScreen} options={{ title: 'Chi tiết sản phẩm' }} />
      </Stack.Navigator>
  );
};

export default AppNavigator;