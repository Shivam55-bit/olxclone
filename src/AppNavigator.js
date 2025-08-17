// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from './screens/HomeScreen';
import Chat from './screens/Chat';
import ChatDetail from './screens/ChatDetail';
import ItemDetails from './screens/ItemDetails';
import Wishlist from './screens/Wishlist';
import { WishlistProvider } from './WishlistContext';
import { ItemsProvider } from './ItemsContext';
import Splash from './screens/Splash';
import OTPScreen from './screens/OTPScreen';

// Newly added screens
import AccountSettings from './screens/AccountSettings';
import Notifications from './screens/Notifications';
import AboutUs from './screens/AboutUs';
import ContactUs from './screens/ContactUs';
import MyAdds from './tabs/MyAdds';
import Search from './tabs/Search';
import AddScreen from './tabs/Add'; // Add Item Screen

// Authentication screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <WishlistProvider>
      <ItemsProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            {/* Auth Screens */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Splash"
              component={Splash}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OTPScreen"
              component={OTPScreen}
              options={{ headerShown: false  }}
            />

            {/* Main Screens */}
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ItemDetails"
              component={ItemDetails}
              options={{ title: 'Item Details' }}
            />
            <Stack.Screen
              name="Wishlist"
              component={Wishlist}
              options={{ title: 'My Wishlist' }}
            />
            <Stack.Screen
              name="Chat"
              component={Chat}
              options={{ title: 'Chats' }}
            />
            <Stack.Screen
              name="ChatDetail"
              component={ChatDetail}
              options={({ route }) => ({ title: route.params.name })}
            />

            {/* Add Item Screen */}
            <Stack.Screen
              name="AddScreen"
              component={AddScreen}
              options={{ title: 'Create Ad' }}
            />

            {/* User Menu / Account Screens */}
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettings}
              options={{ title: 'Account Settings' }}
            />
            <Stack.Screen
              name="Notifications"
              component={Notifications}
              options={{ title: 'Notifications' }}
            />
            <Stack.Screen
              name="AboutUs"
              component={AboutUs}
              options={{ title: 'About Us' }}
            />
            <Stack.Screen
              name="ContactUs"
              component={ContactUs}
              options={{ title: 'Contact Us' }}
            />

            {/* Ads / Search */}
            <Stack.Screen
              name="MyAdds"
              component={MyAdds}
              options={{ title: 'My Ads' }}
            />
            <Stack.Screen
              name="Search"
              component={Search}
              options={{ title: 'Search' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ItemsProvider>
    </WishlistProvider>
  );
};

export default AppNavigator;
