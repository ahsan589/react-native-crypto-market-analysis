import React, { useEffect, useState, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import LottieView from "lottie-react-native"; // Import Lottie

const image1 = require("../assets/images/image1.jpg");
const image2 = require("../assets/images/image2.jpg");
const image3 = require("../assets/images/image3.jpg");
const image4 = require("../assets/images/image4.jpg");
const image6 = require("../assets/images/image6.jpg");
const image7 = require("../assets/images/tt.jpg");
const image8 = require("../assets/images/bin.jpg");
const image9 = require("../assets/images/bii.jpg");
const image5 = require("../assets/images/bit.webp");

// Background images for cards
const priceAlertsBg = require("../assets/images/alert.png");
const exchangeBg = require("../assets/images/exchangeBg.png");
const newsBg = require("../assets/images/niw.png");
const pricePredictorBg = require("../assets/images/pricePredictorBg.jpg");
const cryptoVideosBg = require("../assets/images/vido.png"); // Add this image

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "HomeScreen">;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [translateAnim] = useState(new Animated.Value(0));
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const imageArray = [image1, image2, image3, image4, image6, image7, image8, image9, image5];

  useEffect(() => {
    // Slider animation
    const interval = setInterval(() => {
      Animated.timing(translateAnim, {
        toValue: -(currentIndex + 1) % imageArray.length * SCREEN_WIDTH,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => setCurrentIndex((prevIndex) => (prevIndex + 1) % imageArray.length));
    }, 3000);

    // Fade-in animation for cards
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => clearInterval(interval);
  }, [currentIndex, translateAnim]);

  return (
    <ScrollView
      style={{ backgroundColor: "#f5f5f5", flex: 1 }}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require("../assets/lottie/animation.json")} // Path to your Lottie JSON file
            autoPlay // Automatically play the animation
            loop // Loop the animation
            style={styles.lottieAnimation} // Style for the animation
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Cryptoassets</Text>
            <Text style={styles.subtitle}>Powered by Crypto Market Analysis</Text>
          </View>
        </View>
      </View>

      {/* Image Slider */}
      <View style={styles.sliderCard}>
        <View style={styles.sliderWrapper}>
          <Animated.View style={[styles.imageSlider, { transform: [{ translateX: translateAnim }] }]}>
            {imageArray.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={image} style={styles.image} />
              </View>
            ))}
          </Animated.View>
        </View>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {imageArray.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Cards */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.cardContainer}>
          {/* Top Row: Price Alerts and Exchange */}
          <View style={styles.topRow}>
            {/* Price Alerts Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardPriceAlerts]}
              onPress={() => navigation.navigate("PriceAlert")}
            >
              <ImageBackground source={priceAlertsBg} style={styles.cardBackground} imageStyle={styles.cardBackgroundImage}>
                <Text style={  {fontSize: 15,
                                fontWeight: "bold",
                                marginTop: 120,
                                color: "#fff",
                                marginBottom:4,
                                textAlign: "center"}}></Text>
                <Text style={  {fontSize: 10,
                                fontWeight: "bold",
                                color: "#fff",
                                marginStart: 23,
                                marginBottom:4,
                                textAlign: "center"}}>
                  Get notified on price changes and set alerts.
                </Text>
              </ImageBackground>
            </TouchableOpacity>

            {/* Exchange Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardExchange]}
              onPress={() => navigation.navigate("ExchangesScreen")}
            >
              <ImageBackground source={exchangeBg} style={styles.cardBackground} imageStyle={styles.cardBackgroundImage}>
                <Text style={  {fontSize: 15,
                              fontWeight: "bold",
                              marginTop: 140,
                              color: "#fff",
                              marginBottom:4,
                              textAlign: "center"}}>Exchange</Text>
                <Text style={styles.cardDescription}>
                  Exchange details like volume, Trust Rate, history, etc.
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* Bottom Row: Crypto Videos and News */}
          <View style={styles.bottomRow}>
            {/* Crypto Videos Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardCryptoVideos]}
              onPress={() => navigation.navigate("VideoScreen")}
            >
              <ImageBackground source={cryptoVideosBg} style={styles.cardBackground} imageStyle={styles.cardBackgroundImage}>
                            <Text style={  {fontSize: 15,
                fontWeight: "bold",
                marginTop: -100,
                color: "#fff",
                marginBottom:4,
                textAlign: "center"}}>Crypto Videos</Text>
                <Text style={styles.cardDescription}>
                  Watch beginner-friendly crypto videos and tutorials.
                </Text>
              </ImageBackground>
            </TouchableOpacity>

            {/* News Card */}
            <TouchableOpacity
              style={[styles.card, styles.cardNews]}
              onPress={() => navigation.navigate("NewsScreen")}
            >
              <ImageBackground source={newsBg} style={styles.cardBackground} imageStyle={styles.cardBackgroundImage}>
                <Text style={  {fontSize: 15,
                              fontWeight: "bold",
                              marginTop: -100,
                              color: "#fff",
                              marginBottom:4,
                              textAlign: "center"}}>Crypto News</Text>
                <Text style={styles.cardDescription}>
                  Stay updated with the latest cryptocurrency news.
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>

          {/* AI Crypto Price Predictor Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardPricePredictor]}
            onPress={() => navigation.navigate("CryptoPricePredictor")}
          >
            <ImageBackground source={pricePredictorBg} style={styles.cardBackground} imageStyle={styles.cardBackgroundImage}>
              <Text style={  {fontSize: 16,
                          fontWeight: "bold",
                          marginTop: 100,
                          color: "#fff",
                          marginBottom:4,
                          textAlign: "center"}}>AI Crypto Price Predictor</Text>
              <Text style={styles.cardDescription}>
                Predict future cryptocurrency prices with AI-powered analysis.
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: "#03A9F4",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row', // Align animation and title horizontally
    alignItems: 'center', // Center items vertically
  },
  lottieAnimation: {
    width: 90, // Adjust size as needed
    height: 90, // Adjust size as needed
    marginRight: 10, // Add spacing between animation and title
  },
  headerTextContainer: {
    flexDirection: 'column', // Stack title and subtitle vertically
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: -20,
  },
  subtitle: {
    fontSize: 12,
    color: "#ddd",
    marginLeft: -20,
  },
  sliderCard: {
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  sliderWrapper: {
    height: 200,
  },
  imageSlider: {
    flexDirection: "row",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#6200ea",
  },
  cardContainer: {
    alignItems: "center",
    marginVertical: 5,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SCREEN_WIDTH * 0.9,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SCREEN_WIDTH * 0.9,
    marginBottom: 10,
  },
  card: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  cardBackgroundImage: {
    borderRadius: 15,
  },
  cardPriceAlerts: {
    width: SCREEN_WIDTH * 0.43, // Custom width
    height: 200, // Custom height
    backgroundColor: "#FF5722", // Fallback color
  },
  cardExchange: {
    width: SCREEN_WIDTH * 0.43, // Custom width
    height: 260, // Custom height
    backgroundColor: "#3498db", // Fallback color
  },
  cardCryptoVideos: {
    width: SCREEN_WIDTH * 0.43, // Custom width
    height: 260, // Custom height
    backgroundColor: "#e74c3c",
    marginTop:-60 // Fallback color
  },
  cardNews: {
    width: SCREEN_WIDTH * 0.43, // Custom width
    height: 200, // Custom height
    backgroundColor: "#03A9F4", // Fallback color
  },
  cardPricePredictor: {
    width: SCREEN_WIDTH * 0.9, // Custom width
    height: 180, // Custom height
    backgroundColor: "#03A9F4", // Fallback color
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 110,
    color: "#fff",
    marginBottom:4,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
  },
});

export default HomeScreen;