import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingVertical: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 4,
          height: 80,
          paddingBottom: 10,
        },
      }}
    >      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/home_icon.png')} 
              style={{ 
                width: 23, 
                height: 23,
                tintColor: focused ? '#469B43' : '#666'
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/heart_icon.png')} 
              style={{ 
                width: 25, 
                height: 20,
                tintColor: focused ? '#469B43' : '#666'
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 56,
              height: 56,
              backgroundColor: focused ? '#007bff' : '#469B43',
              borderRadius: 28,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
            }}>
              <Image 
                source={require('../../assets/images/shopping-cart_icon.png')} 
                style={{ 
                  width: 28, 
                  height: 28,
                  tintColor: '#fff'
                }} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/search_icon.png')} 
              style={{ 
                width: 24, 
                height: 24,
                tintColor: focused ? '#469B43' : '#666'
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/settings_icon.png')} 
              style={{ 
                width: 24, 
                height: 24,
                tintColor: focused ? '#469B43' : '#666'
              }} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
