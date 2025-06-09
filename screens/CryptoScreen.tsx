import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import CoinItem from "../component/CoinItem";
import { getMarketData } from "../services/requests";
import LottieView from "lottie-react-native";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  genesis_date?: string;
};

const CryptoScreen = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<LottieView>(null);

  const isNewCoin = (coin: Coin) => {
    if (!coin.genesis_date) return false;
    const now = Date.now();
    const genesisTimestamp = new Date(coin.genesis_date).getTime();
    return now - genesisTimestamp <= 7 * 24 * 60 * 60 * 1000;
  };

  const filterCoins = () => {
    switch (selectedTab) {
      case "gainers":
        return coins
          .filter((coin) => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      case "losers":
        return coins
          .filter((coin) => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
      case "new":
        return coins
          .filter(isNewCoin)
          .sort((a, b) => new Date(b.genesis_date || 0).getTime() - new Date(a.genesis_date || 0).getTime());
      case "volume":
        return [...coins].sort((a, b) => b.total_volume - a.total_volume);
      case "marketcap":
        return [...coins].sort((a, b) => b.market_cap - a.market_cap);
      default:
        return coins;
    }
  };

  const fetchCoins = async (pageNumber: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getMarketData(pageNumber);
      const newCoins = response || [];
      const uniqueCoins = newCoins.filter(
        (newCoin: Coin) => !coins.some((coin) => coin.id === newCoin.id)
      );
      setCoins((prev) => [...prev, ...uniqueCoins]);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setLoading(false);
    }
  };

  const refetchCoins = async () => {
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
    setLoading(true);
    try {
      const response = await getMarketData(1);
      setCoins(response || []);
      setPage(1);
    } catch (error) {
      console.error("Error refetching coins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins(page);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require("../assets/lottie/main.json")}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Cryptoassets</Text>
            <Text style={styles.headerSubtitle}>Powered by Crypto Market Analysis</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["all", "gainers", "losers", "new", "volume", "marketcap"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={filterCoins()}
          renderItem={({ item }) => <CoinItem marketCoin={item} />}
          keyExtractor={(item) => item.id}
          onEndReached={() => fetchCoins(page + 1)}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetchCoins}
              colors={["#03A9F4"]}
              tintColor="#03A9F4"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LottieView
                source={require("../assets/lottie/progress.json")}
                autoPlay
                loop
                style={styles.loadingAnimation}
              />
            </View>
          }
          ListFooterComponent={
            loading ? (
              <View style={styles.footerLoading}>
            
              </View>
            ) : null
          }
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 70,
    height: 70,
    marginRight:0,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "DroidSans",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#ddd",
    fontFamily: "DroidSans",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  tab: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
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

  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#03A9F4",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  footerLoading: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  footerAnimation: {
    width: 80,
    height: 80,
  },
});

export default CryptoScreen;