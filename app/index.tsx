import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Easing,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");
const scale = (size:number) => (width / 375) * size;

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const wordAnim = useRef(new Animated.Value(1)).current;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);

  const words = ["Market","Analyze", "Track", "Insight", "Update", "News"];
  const colors = ["#C70039","#FFD700", "#00E5FF", "#00FF88", "#FF6F00", "#FF3D00"];

  const particleCount = 40;
  const particles = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    anim: new Animated.Value(0),
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 4 + 2,
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
      setShowButton(true);
    });

    const wordInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(wordAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(wordAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 1500);

    particles.forEach((particle) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.anim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(particle.anim, {
            toValue: 0,
            duration: 4000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    return () => clearInterval(wordInterval);
  }, []);

  const handleGetStarted = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 0,
        speed: 12,
        useNativeDriver: true,
      }),
    ]).start(() => router.navigate("/app"));
  };

  return (
    <View style={styles.container}>
      {/* Particles */}
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.anim,
              transform: [
                {
                  translateY: particle.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Lottie Animation */}
        <LottieView
          source={require("../assets/lottie/splash.json")}
          autoPlay
          loop
          style={{
            width: width * 0.9,
            height: height * 0.33,
            marginBottom:22,
          }}
        />

        {/* Title */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Crypto</Text>
          <Animated.Text
            style={[
              styles.highlightWord,
              {
                color: colors[currentWordIndex],
                opacity: wordAnim,
                transform: [
                  {
                    scale: wordAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {words[currentWordIndex]}
          </Animated.Text>
        </View>

        {/* Features */}
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>1000+</Text>
            <Text style={styles.featureText}>Cryptocurrencies</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>24/7</Text>
            <Text style={styles.featureText}>Real-time Data</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureNumber}>80+</Text>
            <Text style={styles.featureText}>Exchanges Tracked</Text>
          </View>
        </View>

        {/* Get Started */}
        {showButton && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [
                  { scale: buttonAnim },
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: buttonAnim,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.button}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Footer */}
        <Text style={styles.footerText}>
          @CryptoMarketAnalysis 2025{"\n"}
          All rights reserved | University of Education
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0c29", // Deep dark blue
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    marginBottom: scale(30),
    alignItems: "flex-end",
  },
  content: {
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  title: {
    fontSize: scale(34),
    fontWeight: "800",
    color: "#fff",
  },
  highlightWord: {
    fontSize: scale(34),
    fontWeight: "900",
    marginLeft: scale(8),
  },
  featureGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: scale(30),
  },
  featureItem: {
    alignItems: "center",
    padding: scale(12),
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    width: "30%",
  },
  featureNumber: {
    fontSize: scale(20),
    fontWeight: "700",
    color: "#00E5FF",
    marginBottom: 5,
  },
  featureText: {
    fontSize: scale(11),
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: scale(20),
    width: "80%",
  },
  button: {
    backgroundColor: "#00E5FF",
    paddingVertical: scale(16),
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#00B8D4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    fontSize: scale(16),
    fontWeight: "700",
    color: "#fff",
  },
  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: scale(11),
    textAlign: "center",
    marginTop: scale(30),
  },
});
