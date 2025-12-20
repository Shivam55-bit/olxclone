// AppNavigator.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Contexts
import { WishlistProvider } from './WishlistContext';
import { ItemsProvider } from './ItemsContext';

// Screens
import HomeScreen from './screens/HomeScreen';

import ItemDetails from './screens/ItemDetails';
import Wishlist from './screens/Wishlist';
import Splash from './screens/Splash';
import OTPScreen from './screens/OTPScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import MyOrders from './screens/MyOrders';
import SellerProfile from './screens/SellerProfile';
import SellCategories from './screens/SellCategories';
import ConnectionsScreen from './screens/ConnectionsScreen';

// Extra Screens
import AccountSettings from './screens/AccountSettings';
import Notifications from './screens/Notifications';
import AboutUs from './screens/AboutUs';
import ContactUs from './screens/ContactUs';
import SellForm from './screens/SellForm';

// Sell Forms
import SellCar from './screens/SellCar';
import SellBikes from './screens/SellBikes';
import SellProperties from './screens/SellProperties';
import SellMobile from './screens/SellMobile';
import SellJobs from './screens/SellJobs';
import SellElectronicsAppliances from './screens/SellElectronicsAppliances';
import SellCommercialVehicles from './screens/SellCommercialVehicles';
import SellMoreItems from './screens/SellMoreItems';
import PropertyDetails from "./screens/PropertyDetails";
import CarForm from './screens/forms/CarForm';
import SellMobileForm from './screens/forms/SellMobileForm';
import JobForm from './screens/forms/JobForm';
import ElectronicsForm from './screens/forms/ElectronicsForm';
import BikeForm from './screens/forms/BikeForm';
import CommercialVehicleForm from './screens/forms/CommercialVehicleForm';
import MoreItemForm from './screens/forms/MoreItemForm';
import OrderDetails from './screens/OrderDetails';
import EditAd from './screens/EditAd';
import SellFashion from './screens/SellFashion';
import FashionForm from './screens/forms/FashionForm';
import ChatDetail from './screens/ChatDetail';

// 🔑 NEW IMPORT: Import the missing PropertyForm component
import PropertyForm from './screens/forms/propertyForms';


// ❌ CHECK THIS ONE — make sure you actually have NextScreen.js with `export default NextScreen`
import NextScreen from './screens/NextScreen';

// import TabBarBackground from "./components/TabBarBackground"; // 👈 import here


// Tabs
import MyAdds from './tabs/MyAds';
import Search from './tabs/Search';
import AddScreen from './tabs/Add';

// Authentication
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <WishlistProvider>
      <ItemsProvider>
        <NavigationContainer>
          {/* <Tab.Navigator
                        screenOptions={{
                            tabBarBackground: () => <TabBarBackground />, // 👈 use here
                        }}
                    ></Tab.Navigator> */}
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >

            {/* Splash */}
            <Stack.Screen name="Splash" component={Splash} />

            {/* Auth */}
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="OTPScreen" component={OTPScreen} />

            {/* Main */}
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen
              name="ItemDetails"
              component={ItemDetails}
              options={{ title: 'Item Details', headerShown: false }}
            />
            <Stack.Screen
              name="Wishlist"
              component={Wishlist}
              options={{ title: 'My Wishlist', headerShown: true }}
            />
            <Stack.Screen
              name="ConnectionsScreen"
              component={ConnectionsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChatDetail"
              component={ChatDetail}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="SellFashion" component={SellFashion} options={{ title: 'Select Fashion Category', headerShown: false }} />
            <Stack.Screen name="FashionForm" component={FashionForm} options={{ headerShown: false }} />

            {/* Ads */}
            <Stack.Screen
              name="AddScreen"
              component={AddScreen}
              options={{ title: 'Create Ad', headerShown: true }}
            />
            <Stack.Screen
              name="EditAd"
              component={EditAd}
              options={{ title: 'Edit Ads', headerShown: false }}
            />

            {/* Seller Profile */}
            <Stack.Screen
              name="SellerProfile"
              component={SellerProfile}
              options={({ navigation }) => ({
                headerShown: false,
                title: "Seller Profile",
                headerLeft: () => (
                  <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
                    <Icon name="arrow-left" size={24} color="#000" />
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <TouchableOpacity onPress={() => console.log("Menu pressed")} style={{ marginRight: 15 }}>
                    <Icon name="dots-vertical" size={24} color="#000" />
                  </TouchableOpacity>
                ),
              })}
            />

            {/* Account */}
            <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Account Settings', headerShown: true }} />
            <Stack.Screen name="Notifications" component={Notifications} options={{ title: 'Notifications', headerShown: true }} />
            <Stack.Screen name="AboutUs" component={AboutUs} options={{ title: 'About Us', headerShown: true }} />
            <Stack.Screen name="ContactUs" component={ContactUs} options={{ title: 'Contact Us', headerShown: true }} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="MyOrders" component={MyOrders} />
            <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />

            {/* Ads & Search */}
            <Stack.Screen name="MyAdds" component={MyAdds} options={{ title: 'My Ads', headerShown: true }} />
            <Stack.Screen name="Search" component={Search} options={{ title: 'Search' }} />

            {/* Sell */}
            <Stack.Screen name="SellCategories" component={SellCategories} options={{ title: 'Select Category', headerShown: true }} />
            <Stack.Screen name="SellForm" component={SellForm} options={{ title: 'Sell Form', headerShown: true }} />
            <Stack.Screen name="SellCar" component={SellCar} options={{ headerShown: false }} />
            <Stack.Screen name="SellBikes" component={SellBikes} options={{ title: 'Bike Details', headerShown: false }} />
            <Stack.Screen name="SellProperties" component={SellProperties} options={{ title: 'Property Details', headerShown: false }} />
            <Stack.Screen name="SellMobile" component={SellMobile} options={{ headerShown: false }} />
            <Stack.Screen name="SellJobs" component={SellJobs} options={{ title: 'Job Details', headerShown: false }} />
            <Stack.Screen name="SellElectronicsAppliances" component={SellElectronicsAppliances} options={{ title: 'Electronics Details', headerShown: false }} />
            <Stack.Screen name="SellCommercialVehicles" component={SellCommercialVehicles} options={{ title: 'Vehicle Details', headerShown: false }} />
            <Stack.Screen name="SellMoreItems" component={SellMoreItems} options={{ title: 'Other Items', headerShown: false }} />
            <Stack.Screen name="PropertyDetails" component={PropertyDetails} />

            {/* 🔑 NEW REGISTRATION: Add the missing PropertyForm screen */}
            <Stack.Screen name="PropertyForm" component={PropertyForm} />

            <Stack.Screen name="CarForm" component={CarForm} />
            <Stack.Screen name="SellMobileForm" component={SellMobileForm} />
            <Stack.Screen name="JobForm" component={JobForm} />
            <Stack.Screen name="ElectronicsForm" component={ElectronicsForm} />
            <Stack.Screen name="BikeForm" component={BikeForm} />
            <Stack.Screen name="CommercialVehicleForm" component={CommercialVehicleForm} />
            <Stack.Screen name="MoreItemForm" component={MoreItemForm} />
            <Stack.Screen name='OrderDetails' component={OrderDetails} />


            {/* Make sure NextScreen is correctly exported */}
            <Stack.Screen name="NextScreen" component={NextScreen} options={{ title: 'Next Screen', headerShown: true }} />
            {/* <Stack.Screen name="CommentsScreen" component={CommentsScreen} options={{ title: 'Comment Screen', headerShown: true }} /> */}


          </Stack.Navigator>
        </NavigationContainer>
      </ItemsProvider>
    </WishlistProvider>
  );
};

export default AppNavigator;