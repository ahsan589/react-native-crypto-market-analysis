import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import CryptoScreen from "../screens/CryptoScreen";
import ExchangesScreen from "../screens/ExchangesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ExchangeDetailsScreen from "../screens/ExchangeDetailsScreen";
import CoinDetailedScreen from "../screens/CoinDetailedScreen";
import Dashboard from "./dashboard";
import WatchlistScreen from "@/screens/WatchlistScreen";
import PriceAlertScreen from "@/screens/PriceAlertScreen";
import CoinItem from "@/component/CoinItem";
import NewsScreen from "@/screens/NewsScreen";
import NewsDetailScreen from "@/screens/NewsDetailScreen";
import { NewsItem } from "../types";
import VideoScreen from "@/screens/VideoScreen";
import DemiScreen from "@/screens/DemiScreen";
import CryptoPricePredictor from "./CryptoPricePredictor ";
import Login from "@/app/LoginScreen";
import SignUp from "@/app/SignupScreen";
import SocialTradingScreen from "../screens/SocialTradingScreen ";
export type RootStackParamList = {
  Market: undefined;
  CoinDetails: { coinId: string };
  News: undefined;
  NewsDetail: { item: NewsItem };
  signup:undefined;
  ForgotPassword: undefined;
  ResetPasswordScreen: { email: string };
};

const Stack = createStackNavigator();

const App = () => {
  return (
   
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" component={Dashboard} />
      
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SocialTradingScreen" component={SocialTradingScreen}  options={{ headerShown: true }}/>
        <Stack.Screen name="signup" component={SignUp} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CryptoScreen" component={CryptoScreen} />
        <Stack.Screen name="ExchangesScreen" component={ExchangesScreen}options={{headerShown:true}}  />
        <Stack.Screen name="PriceAlert" component={PriceAlertScreen} options={{headerShown:true}} />
        <Stack.Screen name="CryptoPricePredictor" component={CryptoPricePredictor} options={{headerShown:true}} />
        <Stack.Screen name="NewsScreen" component={NewsScreen}/>
        <Stack.Screen name="DemiScreen" component={DemiScreen}options={{headerShown:true}} />
        <Stack.Screen
          name="NewsDetail"
          component={(props: any) => <NewsDetailScreen {...props} />}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="ExchangeDetailsScreen"
          component={ExchangeDetailsScreen}
          options={{ headerShown: true }} // Show header for ExchangeDetailsScreen
        />
        <Stack.Screen
          name="CoinDetailedScreen"
          component={CoinDetailedScreen}
          options={{ headerShown: true }} // Show header for CoinDetailedScreen
        />
       
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="WatchlistScreen" component={WatchlistScreen}/>
        <Stack.Screen name="VideoScreen" component={VideoScreen} options={{ headerShown: true }}/>
      </Stack.Navigator>

  );
};

export default App;
