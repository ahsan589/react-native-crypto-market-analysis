import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const DrawerContent = (props: any) => {
  return (
    <View style={styles.drawerContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.curvyBackground}>
          <Image
            source={require("@/assets/images/crypto.webp")}
            style={styles.logo}
          />
          <Text style={styles.appName}>Crypto Market Analysis</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => props.navigation.navigate("MarketInsight")}
      >
        <Ionicons name="grid-outline" size={24} color="#000" />
        <Text style={styles.menuText}>Dashboard</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => props.navigation.navigate("About")}
      >
        <Ionicons name="information-circle-outline" size={24} color="#000" />
        <Text style={styles.menuText}>About</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => props.navigation.navigate("ChangeTheme")}
      >
        <Ionicons name="color-palette-outline" size={24} color="#000" />
        <Text style={styles.menuText}>Change Theme</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => props.navigation.navigate("Logout")}
      >
        <Ionicons name="log-out-outline" size={24} color="#000" />
        <Text style={styles.menuText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  curvyBackground: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 20,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    color: "#000",
  },
});

export default DrawerContent;
