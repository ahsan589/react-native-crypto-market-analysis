import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack"; // Import ThemeProvider and ThemeContext
import { DefaultTheme, DarkTheme } from "@react-navigation/native"; // Import DefaultTheme and DarkTheme
import SocialTradingScreen from "@/screens/SocialTradingScreen ";
// Import screens

import HomeScreen from "../screens/HomeScreen";
import CryptoScreen from "../screens/CryptoScreen";
import ExchangesScreen from "../screens/ExchangesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ExchangeDetailsScreen from "../screens/ExchangeDetailsScreen";
import CoinDetailedScreen from "../screens/CoinDetailedScreen";
import Dashboard from "./dashboard";
import WatchlistScreen from "@/screens/WatchlistScreen";
import NewsScreen from "@/screens/NewsScreen";
import NewsDetailScreen from "@/screens/NewsDetailScreen";
import VideoScreen from "@/screens/VideoScreen";
import DemiScreen from "@/screens/DemiScreen";
import PriceAlertScreen from "@/screens/PriceAlertScreen";
import CryptoPricePredictor from "./CryptoPricePredictor ";
import Login from "./LoginScreen";
import SignUp from "./SignupScreen";
import { NewsItem } from "../types";

// Define custom themes
const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6200EE", // Your primary color
    background: "#FFFFFF", // Light background
    card: "#FFFFFF", // Light card background
    text: "#000000", // Dark text
    border: "#E0E0E0", // Light border
  },

};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#BB86FC", // Your primary color
    background: "#121212", // Dark background
    card: "#1E1E1E", // Dark card background
    text: "#FFFFFF", // Light text
    border: "#333333", // Dark border
  },
};

export type RootStackParamList = {
  Market: undefined;
  CoinDetails: { coinId: string };
  News: undefined;
  NewsDetail: { item: NewsItem };
  ForgotPassword: undefined;
  ResetPasswordScreen: { email: string };

};

const Stack = createStackNavigator();

const App = () => {
  return (
   
 
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SocialTradingScreen" component={SocialTradingScreen}  options={{ headerShown: true }}/>
            <Stack.Screen name="dashboard" component={Dashboard} />
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="CryptoScreen" component={CryptoScreen} />
            <Stack.Screen name="signup" component={SignUp} />
            <Stack.Screen name="CryptoPricePredictor" component={CryptoPricePredictor} />
            <Stack.Screen
              name="ExchangesScreen"
              component={ExchangesScreen}
            />
            <Stack.Screen name="NewsScreen" component={NewsScreen} />
            <Stack.Screen
              name="DemiScreen"
              component={DemiScreen}
            />
            <Stack.Screen
              name="NewsDetail"
              component={(props: any) => <NewsDetailScreen {...props} />}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="ExchangeDetailsScreen"
              component={ExchangeDetailsScreen}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="PriceAlert"
              component={PriceAlertScreen}
              options={{ headerShown: true }}
            />
            <Stack.Screen
              name="CoinDetailedScreen"
              component={CoinDetailedScreen}
              options={{ headerShown: true }}
            />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="WatchlistScreen" component={WatchlistScreen} />
            <Stack.Screen
              name="VideoScreen"
              component={VideoScreen}
            />
            <Stack.Screen name="Login" component={Login} />
            
        <Stack.Screen name="Login" component={Login} />
      
          </Stack.Navigator>
        </NavigationContainer>

 
  );
};

export default App;