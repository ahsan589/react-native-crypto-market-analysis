import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import axios from "axios";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import LottieView from "lottie-react-native";

interface ExchangeDetails {
  id: string;
  name: string;
  image: string;
  trust_score_rank: number;
  country: string;
  year_established: number;
  trade_volume_24h_btc: number;
  url: string;
  description: string;
  facebook_url: string;
  twitter_handle: string;
  reddit_url: string;
  telegram_url: string;
  markets: number;
}

const MAX_DESCRIPTION_LINES = 3; // Number of lines to show initially

const ExchangeDetailScreen = ({ route, navigation }: any) => {
  const { exchangeId } = route.params;
  const [exchange, setExchange] = useState<ExchangeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionHeight = useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  useEffect(() => {
    const fetchExchangeDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/exchanges/${exchangeId}`
        );
        setExchange(response.data);
        navigation.setOptions({ title: response.data.name });
      } catch (err) {
        setError("Failed to load exchange details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeDetails();
  }, [exchangeId]);

  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
    Animated.timing(descriptionHeight, {
      toValue: showFullDescription ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    fetchExchangeDetails();
  };

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
         <LottieView
                   source={require('../assets/lottie/progress.json')} // Lottie JSON file
                   autoPlay // Automatically play the animation
                   loop // Loop the animation
                   style={styles.lottieAnimation} // Style for the animation
           />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.error, { color: colors.notification }]}>{error}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!exchange) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.error, { color: colors.notification }]}>
          Exchange details not available
        </Text>
      </View>
    );
  }

  const descriptionLines = exchange.description
    ? exchange.description.split("\n").filter((line: string) => line.trim() !== "")
    : [];

  const descriptionText = descriptionLines.join("\n");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Image
          source={{ uri: exchange.image || "https://via.placeholder.com/150" }}
          style={styles.logo}
          accessibilityLabel={`${exchange.name} logo`}
        />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{exchange.name}</Text>
          <Text style={[styles.country, { color: colors.text }]}>
            <Ionicons name="location" size={14} color={colors.text} />{" "}
            {exchange.country || "Global"}
          </Text>
        </View>
      </View>

      <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            #{exchange.trust_score_rank || "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Trust Rank</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {exchange.year_established || "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Established</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {exchange.markets?.toLocaleString() || "N/A"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Markets</Text>
        </View>
      </View>

      <View style={[styles.volumeContainer, { backgroundColor: colors.card }]}>
        <MaterialIcons name="data-usage" size={20} color={colors.text} />
        <Text style={[styles.volumeText, { color: colors.text }]}>
          24h Volume:{" "}
          <Text style={{ fontWeight: "700",color: colors.primary  }}>
            {exchange.trade_volume_24h_btc?.toFixed(2) || "N/A"} BTC
          </Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.websiteButton]}
        onPress={() => openLink(exchange.url)}
      >
        <Ionicons name="globe" size={20} color="white" />
        <Text style={styles.websiteButtonText}>Visit Website</Text>
      </TouchableOpacity>

      {exchange.description && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Animated.Text
            style={[
              styles.description,
              { color: colors.text },
              {
                maxHeight: descriptionHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [MAX_DESCRIPTION_LINES * 20, 1000], // Adjust based on line height
                }),
                opacity: descriptionHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ]}
            numberOfLines={showFullDescription ? undefined : MAX_DESCRIPTION_LINES}
          >
            {descriptionText}
          </Animated.Text>
          <TouchableOpacity onPress={toggleDescription} style={styles.showMoreButton}>
            <Text style={[styles.showMoreText, { color: colors.primary }]}>
              {showFullDescription ? "Show Less" : "Show More"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Social Links</Text>
        <View style={styles.socialLinks}>
          {exchange.facebook_url && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink(exchange.facebook_url)}
            >
              <Ionicons name="logo-facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
          )}
          {exchange.twitter_handle && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink(`https://twitter.com/${exchange.twitter_handle}`)}
            >
              <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
            </TouchableOpacity>
          )}
          {exchange.reddit_url && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => openLink(exchange.reddit_url)}
            >
              <Ionicons name="logo-reddit" size={24} color="#ff4500" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  lottieAnimation: {
    width: 150, // Adjust width as needed
    height: 150, // Adjust height as needed
  },
  error: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#03A9F4",
  },
  retryText: {
    color: "white",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  country: {
    fontSize: 16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  volumeText: {
    marginLeft: 8,
    fontSize: 16,
    
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#03A9F4",
    padding: 16,
    marginBottom: 16,
  },
  websiteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  showMoreButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  socialButton: {
    padding: 8,
  },
});

export default ExchangeDetailScreen;

function fetchExchangeDetails() {
  throw new Error("Function not implemented.");
}
