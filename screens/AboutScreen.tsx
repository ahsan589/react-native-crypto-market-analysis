import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type AboutScreenProps = {
  navigation: any;
};

export default function AboutScreen({ navigation }: AboutScreenProps) {
  return (
    <View style={styles.container}>
    
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/crypto.png")} // Replace with your logo path
            style={styles.logo}
          />
        </View>
        <Text style={styles.appName}>Crypto Market Analysis</Text>
        <Text style={styles.description}>
          Crypto Market Analysis is an app designed to provide real-time
          cryptocurrency data, market trends, and user-friendly tools for
          traders and enthusiasts. Stay updated on top gainers, losers, and
          build your watchlist for personalized tracking.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 15,
    elevation: 4, // Shadow effect for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    lineHeight: 22,
  },
});
