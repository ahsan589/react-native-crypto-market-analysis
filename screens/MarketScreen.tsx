import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AntDesign } from "@expo/vector-icons";
import { RootStackParamList } from "../types";
import LottieView from "lottie-react-native"; // Import Lottie

type MarketScreenNavigationProp = StackNavigationProp<RootStackParamList, "Market">;

type Crypto = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
};

const MarketScreen = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<MarketScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allData: Crypto[] = [];
        const pages = 3; // Fetching data from multiple pages (500 * 2 = 1000 coins)

        for (let page = 1; page <= pages; page++) {
          const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 250,
              page,
            },
          });
          allData = [...allData, ...response.data];
        }

        setCryptos(allData);
        setFilteredCryptos(allData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    
    fetchData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilteredCryptos(
      text
        ? cryptos.filter(
            (crypto) =>
              crypto.name.toLowerCase().includes(text.toLowerCase()) ||
              crypto.symbol.toLowerCase().includes(text.toLowerCase())
          )
        : cryptos
    );
  };

  const normalizeMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return (marketCap / 1e12).toFixed(2) + "T";
    if (marketCap >= 1e9) return (marketCap / 1e9).toFixed(2) + "B";
    if (marketCap >= 1e6) return (marketCap / 1e6).toFixed(2) + "M";
    return marketCap.toString();
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
  return (
    <View style={styles.screen}>
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require("../assets/lottie/serc.json")} // Path to your Lottie JSON file
            autoPlay // Automatically play the animation
            loop // Loop the animation
            style={styles.lottieAnimation} // Style for the animation
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Search & Filter</Text>
            <Text style={styles.headerSubtitle}>Explore the latest cryptocurrency prices</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or symbol..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* Crypto List */}
      {loading ? (
        <ActivityIndicator size="large" color="#03A9F4" style={styles.loadingIndicator} />
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={filteredCryptos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const percentageColor = item.price_change_percentage_24h < 0 ? "#ea3943" : "#16c784";

              return (
                <TouchableOpacity
                  style={styles.cryptoItem}
                  onPress={() => navigation.navigate("CoinDetailedScreen", { coinId: item.id })}
                >
                  <View style={styles.coinInfoContainer}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <View>
                      <Text style={styles.title}>{item.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={styles.rankContainer}>
                          <Text style={styles.rank}>{item.market_cap_rank}</Text>
                        </View>
                        <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
                        <AntDesign
                          name={item.price_change_percentage_24h < 0 ? "caretdown" : "caretup"}
                          size={12}
                          color={percentageColor}
                          style={{ marginRight: 5 }}
                        />
                        <Text style={{ color: percentageColor, fontSize: 14 }}>
                          {item.price_change_percentage_24h?.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.coinDetails}>
                    <Text style={styles.price}>${item.current_price?.toFixed(2)}</Text>
                    <Text style={styles.marketCap}>
                      MCap {normalizeMarketCap(item.market_cap)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      )}
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
  headerRow: {
    flexDirection: "row", // Align animation and title horizontally
    alignItems: "center", // Center items vertically
  },
  lottieAnimation: {
    width: 60, // Adjust size as needed
    height: 60, // Adjust size as needed
    marginRight: 10, // Add spacing between animation and title
  },
  headerTextContainer: {
    flexDirection: "column", // Stack title and subtitle vertically
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#333",
  },
  cryptoItem: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coinInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  rankContainer: {
    backgroundColor: "#585858",
    borderRadius: 5,
    paddingHorizontal: 6,
    marginRight: 5,
  },
  rank: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  symbol: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginRight: 5,
  },
  coinDetails: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  marketCap: {
    fontSize: 13,
    color: "#555",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MarketScreen;