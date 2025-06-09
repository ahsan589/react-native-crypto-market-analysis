import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  Alert,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/types";

type Sentiment = 'positive' | 'negative' | 'neutral';
type VotesState = { [key: string]: 'up' | 'down' };
const MAX_NEWS_ITEMS = 20;

const POSITIVE_KEYWORDS = [
  'bullish', 'surge', 'growth', 'adopt', 'positive', 'rise', 'approve', 'gain',
  'success', 'breakout', 'innovation', 'partnership', 'launch', 'milestone',
  'approval', 'win', 'solution', 'advantage', 'profit', 'moon', 'rally',
  'breakthrough', 'all-time high', 'ATH', 'soar', 'boom', 'recovery'
];

const NEGATIVE_KEYWORDS = [
  'bearish', 'drop', 'crash', 'scam', 'hack', 'ban', 'negative', 'loss', 'fail',
  'warning', 'alert', 'risk', 'volatility', 'fraud', 'sell-off', 'plunge', 'dip',
  'trouble', 'issue', 'delay', 'lawsuit', 'investigation', 'FUD', 'bankruptcy',
  'collapse', 'correction', 'retreat', 'sink', 'decline', 'dump'
];

interface CoinDetails {
  name: string;
  symbol: string;
  market_data?: {
    current_price: {
      usd: number;
      btc: number;
    };
    market_cap: {
      usd: number;
      btc: number;
    };
    total_volume: {
      usd: number;
      btc: number;
    };
    price_change_percentage_24h?: number;
  };
  image: {
    large?: string;
  };
}

type RouteParams = {
  coinId: string;
};

type NewsItem = {
  id: string;
  guid: string;
  published_on: number;
  imageurl: string;
  title: string;
  url: string;
  body: string;
  tags: string;
  lang: string;
  upvotes: number;
  downvotes: number;
  categories: string;
  source_info: {
    name: string;
    img: string;
    lang: string;
  };
  source: string;
};

const MAX_WATCHLIST_COINS = 15;
const CoinDetailedScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { coinId } = route.params as RouteParams;
  const { colors } = useTheme();
  const [coinDetails, setCoinDetails] = useState<CoinDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const isInWatchlist = watchlist.includes(coinId);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [votes, setVotes] = useState<VotesState>({});
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const savedVotes = await AsyncStorage.getItem('@crypto_news_votes');
        if (savedVotes) setVotes(JSON.parse(savedVotes));
        
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        const data = await response.json();
        
        if (!data.market_data) {
          data.market_data = {
            current_price: { usd: 0, btc: 0 },
            market_cap: { usd: 0, btc: 0 },
            total_volume: { usd: 0, btc: 0 },
            price_change_percentage_24h: 0,
          };
        }
        fetchWatchlist();
        setCoinDetails(data);
        await fetchNews(coinId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    return () => { isMounted.current = false; };
  }, [coinId]);



  const fetchNews = async (coinId: string, page = 1, existingData: NewsItem[] = [], lastTimestamp?: number) => {
    try {
      const params = lastTimestamp ? { lTs: lastTimestamp } : {};
      const response = await axios.get("https://min-api.cryptocompare.com/data/v2/news/", { params });
      
      const responseData = response.data as { Data: NewsItem[] };
      const filteredNews = responseData.Data.filter((item: NewsItem) =>
        item.title.toLowerCase().includes(coinId.toLowerCase())
      );

      const combinedNews = [...existingData, ...filteredNews];
      const newLastTimestamp = responseData.Data[responseData.Data.length - 1]?.published_on;

      if (combinedNews.length >= MAX_NEWS_ITEMS || !responseData.Data.length) {
        setNews(combinedNews.slice(0, MAX_NEWS_ITEMS));
        setNewsLoading(false);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        fetchNews(coinId, page + 1, combinedNews, newLastTimestamp);
      }
    } catch (err) {
      console.error("News fetch error:", err);
      setNewsLoading(false);
    }
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    if (votes[id]) return;
    const newVotes = { ...votes, [id]: type };
    try {
      await AsyncStorage.setItem('@crypto_news_votes', JSON.stringify(newVotes));
      setVotes(newVotes);
    } catch (e) {
      console.error('Vote save error:', e);
    }
  };

  const getSentiment = (item: NewsItem): Sentiment => {
    const content = `${item.title} ${item.body}`.toLowerCase();
    const positiveScore = POSITIVE_KEYWORDS.filter(w => content.includes(w)).length;
    const negativeScore = NEGATIVE_KEYWORDS.filter(w => content.includes(w)).length;
    const totalVotes = item.upvotes + item.downvotes;
    const voteRatio = totalVotes > 0 ? (item.upvotes - item.downvotes) / totalVotes : 0;
    const combinedScore = (positiveScore - negativeScore) * 0.7 + voteRatio * 0.3;

    if (combinedScore > 0.3) return 'positive';
    if (combinedScore < -0.3) return 'negative';
    return 'neutral';
  };

  const fetchWatchlist = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("watchlist");
      const storedWatchlist = jsonValue ? JSON.parse(jsonValue) : [];
      setWatchlist(storedWatchlist);
    } catch (e) {
      console.error("Failed to fetch watchlist", e);
      setError("Failed to load watchlist.");
    }
  };

  const toggleWatchlist = async () => {
    try {
      let updatedWatchlist: string[];
      if (isInWatchlist) {
        updatedWatchlist = watchlist.filter((id) => id !== coinId); // Remove coin
      } else {
        if (watchlist.length >= MAX_WATCHLIST_COINS) {
          Alert.alert("Limit Reached", "You can only add up to 15 coins to your watchlist.");
          return;
        }
        updatedWatchlist = [...watchlist, coinId]; // Add coin
      }

      // Update AsyncStorage
      await AsyncStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
      setWatchlist(updatedWatchlist); // Update state

      // Animation
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    } catch (e) {
      console.error("Failed to update watchlist", e);
      setError("Failed to update watchlist. Please try again.");
    }
  };
 

  const renderNewsItem = ({ item }: { item: NewsItem }) => {
    const userVote = votes[item.id];
    const hasVoted = !!userVote;
    const displayedUpvotes = item.upvotes + (userVote === 'up' ? 1 : 0);
    const displayedDownvotes = item.downvotes + (userVote === 'down' ? 1 : 0);
    const sentiment = getSentiment({ ...item, upvotes: displayedUpvotes, downvotes: displayedDownvotes });

    return (
      <TouchableOpacity
        style={styles.newsCard}
        onPress={() => navigation.navigate("NewsDetail", { item })}
      >
        <View style={styles.sentimentContainer}>
          <View style={[
            styles.sentimentDot,
            sentiment === 'positive' && styles.positiveDot,
            sentiment === 'negative' && styles.negativeDot,
            sentiment === 'neutral' && styles.neutralDot,
          ]} />
          <Text style={styles.sentimentText}>{sentiment?.toUpperCase()}</Text>
        </View>

        <Image source={{ uri: item.imageurl }} style={styles.newsImage} />
        
        <View style={styles.newsTextContainer}>
          <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.newsSource}>{item.source_info.name}</Text>
          
          <View style={styles.newsMetricsContainer}>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(item.id, 'up')}
              disabled={hasVoted}
            >
              <Icon
                name="thumbs-up"
                size={14}
                color={userVote === 'up' ? "#4CAF50" : "#999"}
              />
              <Text style={[styles.newsUpvotes, { color: userVote === 'up' ? "#4CAF50" : "#999" }]}>
                {displayedUpvotes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(item.id, 'down')}
              disabled={hasVoted}
            >
              <Icon
                name="thumbs-down"
                size={14}
                color={userVote === 'down' ? "#F44336" : "#999"}
              />
              <Text style={[styles.newsDownvotes, { color: userVote === 'down' ? "#F44336" : "#999" }]}>
                {displayedDownvotes}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  if (!coinDetails) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const priceChangeColor = coinDetails.market_data?.price_change_percentage_24h ?? 0 >= 0 ? "red" : "green";
  const priceChangeIcon = coinDetails.market_data?.price_change_percentage_24h ?? 0 >= 0 ? "arrow-up" : "arrow-down";
  const chartUrl = `https://s.tradingview.com/widgetembed/?symbol=${coinDetails.symbol}USD&interval=1D&hidesidetoolbar=1&theme=Light`;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} />}
    >
      <View style={styles.header}>
        <Image source={{ uri: coinDetails.image?.large }} style={styles.coinImage} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{coinDetails?.name}</Text>
          <Text style={styles.subtitle}>{coinDetails?.symbol}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            ${coinDetails?.market_data?.current_price?.usd?.toFixed(6)}
          </Text>
          <Text style={styles.statLabel}>Current Price</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {coinDetails.market_data?.market_cap?.btc}
          </Text>
          <Text style={styles.statLabel}>MCap (BTC)</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {coinDetails.market_data?.total_volume.btc} BTC
          </Text>
          <Text style={styles.statLabel}>24h Volume</Text>
        </View>
      </View>

      {coinDetails.market_data?.price_change_percentage_24h !== undefined && (
        <View style={styles.priceChangeContainer}>
          <Icon name={priceChangeIcon} size={15} color={priceChangeColor} />
          <Text style={[styles.priceChange, { color: priceChangeColor }]}>
            24h Change: {coinDetails?.market_data?.price_change_percentage_24h?.toFixed(3)}%
          </Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={toggleWatchlist}
          style={[styles.watchlistButton, { backgroundColor: isInWatchlist ? "#ff4444" : "#007bff" }]}
        >
          <Icon name={isInWatchlist ? "star" : "star-o"} size={16} color="#fff" />
          <Text style={styles.watchlistButtonText}>
            {isInWatchlist ? "Remove From Watchlist" : "Add to Watchlist"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {chartUrl && (
  <View style={styles.chartContainer}>
    <WebView
      source={{ uri: chartUrl }}
      style={styles.webView}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  </View>
)}

      <Text style={styles.newsHeader}>Related News</Text>
      {newsLoading ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  coinImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  priceChangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 26,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 109,
  },
  watchlistButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  watchlistButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  chartContainer: {
    height: 260,
    marginBottom: 16,
  },
  webView: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  newsHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  newsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  newsTextContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  newsSource: {
    fontSize: 12,
    color: "#666",
  },
  newsMetricsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  newsUpvotes: {
    fontSize: 12,
    fontWeight: "500",
  },
  newsDownvotes: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sentimentContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 4,
    borderRadius: 8,
    gap: 4,
    zIndex: 1,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  positiveDot: {
    backgroundColor: '#4CAF50',
  },
  negativeDot: {
    backgroundColor: '#F44336',
  },
  neutralDot: {
    backgroundColor: '#FFC107',
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default CoinDetailedScreen;