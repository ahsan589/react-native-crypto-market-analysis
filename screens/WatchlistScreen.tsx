import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { WatchlistScreenNavigationProp } from "../types/navigation";
import LottieView from "lottie-react-native"; // Import Lottie

interface CoinDetails {
  id: string;
  name: string;
  symbol: string;
  image?: {
    large: string;
  };
  market_data?: {
    current_price?: {
      usd: number;
    };
    price_change_percentage_24h?: number;
  };
}

const WatchlistScreen: React.FC = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [coins, setCoins] = useState<CoinDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused(); // Add focus listener

  useEffect(() => {
    if (isFocused) {
      // Refresh data when screen comes into focus
      fetchWatchlist();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  const fetchWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("watchlist");
      const storedWatchlist = jsonValue ? JSON.parse(jsonValue) : [];
      setWatchlist(storedWatchlist);
      fetchCoinsDetails(storedWatchlist);
    } catch (e) {
      console.error("Failed to fetch watchlist", e);
      setError("Failed to load watchlist.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoinsDetails = async (coinIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const coinsData = await Promise.all(
        coinIds.map(async (coinId) => {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${coinId}`
            );
            return response.ok ? await response.json() : null;
          } catch (error) {
            console.error(`Error fetching ${coinId}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and invalid responses
      const validCoins = coinsData.filter(
        (coin) => coin !== null && coin.id && coin.name
      );
      setCoins(validCoins);
    } catch (error) {
      setError("Error fetching coin details. Please try again.");
      console.error("Error fetching coin details", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (coinId: string) => {
    const updatedWatchlist = watchlist.filter((id) => id !== coinId);
    setWatchlist(updatedWatchlist);
    setCoins(coins.filter((coin) => coin.id !== coinId));
    try {
      await AsyncStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    } catch (e) {
      console.error("Failed to update watchlist", e);
    }
  };

  const renderItem = ({ item }: { item: CoinDetails }) => {
    const priceChangePercentage = item.market_data?.price_change_percentage_24h ?? 0;
    const priceChangeColor = priceChangePercentage >= 0 ? "#16c784" : "#ea3943";
    const priceChangeIcon = priceChangePercentage >= 0 ? "arrow-up" : "arrow-down";
    const currentPrice = item.market_data?.current_price?.usd ?? 0;
    const coinImage = item.image?.large ?? "https://via.placeholder.com/40"; // Fallback image

    return (
      <TouchableOpacity
        style={styles.coinContainer}
        onPress={() => navigation.navigate("CoinDetailedScreen", { coinId: item.id })}
      >
        <Image source={{ uri: coinImage }} style={styles.coinImage} resizeMode="contain" />
        <View style={styles.coinInfo}>
          <Text style={styles.coinName}>{item.name}</Text>
          <Text style={styles.coinSymbol}>{item.symbol.toUpperCase()}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.coinPrice}>${currentPrice.toFixed(2)}</Text>
          <View style={styles.priceChangeContainer}>
            <Icon name={priceChangeIcon} size={12} color={priceChangeColor} />
            <Text style={[styles.priceChange, { color: priceChangeColor }]}>
              {priceChangePercentage.toFixed(2)}%
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => removeFromWatchlist(item.id)} style={styles.removeButton}>
        <LottieView
           source={require('../assets/lottie/rename.json')}
           autoPlay
           loop
           style={styles.deleanimation}
         />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

   if (loading) {
     return (
       <View style={styles.loadingContainer}>
         <LottieView
           source={require('../assets/lottie/progress.json')}
           autoPlay
           loop
           style={styles.loadingAnimation}
         />
    
       </View>
     );
   }

  if (error) {
    return (
      <View style={styles.errorContainer}>
           <LottieView
                    source={require("../assets/lottie/error.json")} // Path to your Lottie JSON file
                    autoPlay // Automatically play the animation
                    loop // Loop the animation
                    style={styles.lottieAnimation} // Style for the animation
                  />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchWatchlist} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require('../assets/lottie/blew.json')} // Path to your Lottie JSON file
            autoPlay // Automatically play the animation
            loop // Loop the animation
            style={styles.lottieAnimation} // Style for the animation
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Watchlist</Text>
            <Text style={styles.headerSubtitle}>Track your favorite assets</Text>
          </View>
        </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {coins.length > 0 ? (
          <FlatList
            data={coins}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.emptyText}>
            {loading ? "Loading..." : "Your watchlist is empty."}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#03A9F4",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleanimation: {
    width: 40, // Adjust size as needed
    height: 40, // Adjust size as needed
    marginLeft: 10, // Add spacing between animation and title

  },
  headerRow: {
    flexDirection: 'row', // Align animation and title horizontally
    alignItems: 'center', // Center items vertically
  },
  lottieAnimation: {
    width: 60, // Adjust size as needed
    height: 60, // Adjust size as needed
    marginRight: 10, // Add spacing between animation and title
  },
  headerTextContainer: {
    flexDirection: 'column', // Stack title and subtitle vertically
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#ddd",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  coinImage: {
    width: 40,
    height: 40,
    marginRight: 15,
    borderRadius: 20,
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  coinSymbol: {
    fontSize: 14,
    color: "#555",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  coinPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  removeButton: {
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#03A9F4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default WatchlistScreen;