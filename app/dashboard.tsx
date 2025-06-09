import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Animated,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Href, useRouter } from "expo-router";

// Screen imports
import CryptoScreen from "../screens/CryptoScreen";
import HomeScreen from "../screens/HomeScreen";
import MarketScreen from "../screens/MarketScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import AboutScreen from "../screens/AboutScreen";
import ChangeThemeScreen from "../screens/ChangeThemeScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import NewsScreen from "@/screens/NewsScreen";
import SocialTradingScreen from "@/screens/SocialTradingScreen ";
import Login from "./LoginScreen";
import { COLORS, ICONS } from "./constants";
import { Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Tab Navigation Component
function TabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = ICONS[route.name as keyof typeof ICONS] || "logo-bitcoin";
          return (
            <Ionicons
              name={focused ? iconName : `${iconName}`}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: COLORS.black,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Crypto" component={CryptoScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
    </Tab.Navigator>
  );
}

// Drawer Content Component
function DrawerContent(props: any) {
  const animatedValue = new Animated.Value(1);
  const router = useRouter();

  
 
  const handleLogout = async () => {
    try {
      router.replace("/LoginScreen");
      Alert.alert("Success", "You have been logged out.");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "An error occurred while logging out.");
    }
  };



  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.header}>
        <Image source={require("../assets/images/crypto.png")} style={styles.lottieAnimation} />
     
      </View>

   
 

      {/* Menu Items Section */}
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderText}>MENU</Text>
      </View>
      {[
         { name: "DemiScreen", icon: "logo-bitcoin" },
        { name: "About", icon: "information-circle-outline" },
        { name: "HelpSupport", icon: "help-circle-outline" },
        { name: "SocialTradingScreen", icon: "people-outline" },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItemCard}
          onPress={() => props.navigation.navigate(item.name)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>{item.name}</Text>
        </TouchableOpacity>
        
           
      ))}
         {/* Notification Section */}
         
         <TouchableOpacity 
         style={styles.menuItemCard}
         onPress={handleLogout}>

         <View style={styles.iconContainer}>
          <Icon name="log-out-outline" size={20} color={COLORS.primary} />
          </View>
         <Text style={styles.menuText}>Logout</Text>
       </TouchableOpacity>
       <Text style={styles.footerText}>  
                    @CryptoMarketAnalysis 2025{"\n"}  
                    All rights reserved | University of Education  
                </Text>  
      </View>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: "70%",
          backgroundColor: COLORS.white,
        },
        drawerItemStyle: { display: 'none' },
        drawerHideStatusBarOnOpen: false
      }}
    >
      <Drawer.Screen name="Crypto-Market-Analysis" component={TabNavigation} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Drawer.Screen name="SocialTradingScreen" component={SocialTradingScreen} />
    </Drawer.Navigator>
  );
}

// Styles
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 0,
  },
  header: {
    backgroundColor: "#03A9F4",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: "#333",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  footerText: {  
    color: 'rgba(10, 0, 0, 0.5)',  
    fontSize: 12,  
    marginTop: 80,  
    textAlign: 'center',  
    lineHeight: 18,  
},  
  headerSubtitle: {
    fontSize: 14,
    color: "#ddd",
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    borderRadius: 40,
    marginTop:0,
    marginBottom: 0,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.gray,
    textTransform: "uppercase",
  },
  menuItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  iconContainer: {
    backgroundColor: COLORS.lightPrimary,
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.black,
  },
});