import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native"; // Import Lottie

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

type NewsScreenNavigationProp = StackNavigationProp<RootStackParamList, "NewsScreen">;

type Sentiment = 'positive' | 'negative' | 'neutral';
type VotesState = { [key: string]: 'up' | 'down' };

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const getSentiment = (item: NewsItem): Sentiment => {
  const content = `${item.title} ${item.body}`.toLowerCase();
  
  const positiveScore = POSITIVE_KEYWORDS.filter(word => content.includes(word)).length;
  const negativeScore = NEGATIVE_KEYWORDS.filter(word => content.includes(word)).length;

  const totalVotes = item.upvotes + item.downvotes;
  const voteRatio = totalVotes > 0 
    ? (item.upvotes - item.downvotes) / totalVotes
    : 0;

  const combinedScore = 
    (positiveScore - negativeScore) * 0.7 + 
    voteRatio * 0.3;

  if (combinedScore > 0.3) return 'positive';
  if (combinedScore < -0.3) return 'negative';
  return 'neutral';
};

const NewsScreen = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [votes, setVotes] = useState<VotesState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NewsScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchNews = async (page = 1, existingData: NewsItem[] = [], lastTimestamp?: number) => {
    try {
      let url = "https://min-api.cryptocompare.com/data/v2/news/";
      if (lastTimestamp) {
        url += `?lTs=${lastTimestamp}`;
      }

      const response = await axios.get(url);
      const newData = response.data.Data.map((item: any) => ({
        ...item,
        upvotes: parseInt(item.upvotes) || 0,
        downvotes: parseInt(item.downvotes) || 0,
      }));

      const combinedData = [...existingData, ...newData];
      
      // Get timestamp of last item for pagination
      const newLastTimestamp = newData[newData.length - 1]?.published_on;

      // Stop when we have 200 items or no more data
      if (combinedData.length >= 200 || newData.length === 0) {
        setNews(combinedData.slice(0, 200)); // Limit to 200 items
        setLoading(false);
      } else {
        // Add slight delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
        fetchNews(page + 1, combinedData, newLastTimestamp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const savedVotes = await AsyncStorage.getItem('@crypto_news_votes');
        if (savedVotes) setVotes(JSON.parse(savedVotes));
        
        // Start fetching news
        fetchNews();
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setLoading(false);
      }
    };

    initializeData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleVote = async (id: string, type: 'up' | 'down') => {
    if (votes[id]) return; // Prevent multiple votes
    
    const newVotes = { ...votes, [id]: type };
    
    try {
      await AsyncStorage.setItem('@crypto_news_votes', JSON.stringify(newVotes));
      setVotes(newVotes);
    } catch (e) {
      console.error('Failed to save vote:', e);
    }
  };

  const renderItem = ({ item }: { item: NewsItem }) => {
    const userVote = votes[item.id];
    const hasVoted = !!userVote;
    const displayedUpvotes = item.upvotes + (userVote === 'up' ? 1 : 0);
    const displayedDownvotes = item.downvotes + (userVote === 'down' ? 1 : 0);
    const totalVotes = displayedUpvotes + displayedDownvotes;
    
    const sentiment = getSentiment({
      ...item,
      upvotes: displayedUpvotes,
      downvotes: displayedDownvotes,
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("NewsDetail", { item })}
      >
        <Image
          source={{ uri: item.imageurl }}
          style={styles.circularImage}
          defaultSource={require("../assets/images/favicon.png")}
        />

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={3}>{item.body}</Text>
          <Text style={styles.source}>{item.source_info.name}</Text>
          
          <View style={styles.metricsContainer}>
            <TouchableOpacity
              style={[styles.voteButton, hasVoted && styles.disabledVote]}
              onPress={() => handleVote(item.id, 'up')}
              disabled={hasVoted}
            >
              <Icon
                name="thumbs-up"
                size={16}
                color={userVote === 'up' ? "#4CAF50" : "#999"}
              />
              <Text style={[
                styles.voteCount,
                { color: userVote === 'up' ? "#4CAF50" : "#999" }
              ]}>
                {displayedUpvotes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voteButton, hasVoted && styles.disabledVote]}
              onPress={() => handleVote(item.id, 'down')}
              disabled={hasVoted}
            >
              <Icon
                name="thumbs-down"
                size={16}
                color={userVote === 'down' ? "#F44336" : "#999"}
              />
              <Text style={[
                styles.voteCount,
                { color: userVote === 'down' ? "#F44336" : "#999" }
              ]}>
                {displayedDownvotes}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.sentimentContainer}>
          <View style={[
            styles.sentimentDot,
            sentiment === 'positive' && styles.positiveDot,
            sentiment === 'negative' && styles.negativeDot,
            sentiment === 'neutral' && styles.neutralDot,
          ]} />
          <Text style={styles.sentimentText}>
            {sentiment.toUpperCase()} | Votes: {totalVotes}
          </Text>
        </View>
        <View style={styles.voteBarContainer}>
          <View style={[
            styles.voteBar,
            { width: `${(displayedUpvotes / (totalVotes || 1)) * 100}%` }
          ]} />
          <View style={[
            styles.voteBar,
            { 
              width: `${(displayedDownvotes / (totalVotes || 1)) * 100}%`,
              backgroundColor: '#F44336'
            }
          ]} />
        </View>
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
      <View style={styles.center}>
           <LottieView
            source={require("../assets/lottie/error.json")} // Path to your Lottie JSON file
            autoPlay // Automatically play the animation
            loop // Loop the animation
            style={styles.lottieAnimation} // Style for the animation
          />
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require("../assets/lottie/niw.json")} // Path to your Lottie JSON file
            autoPlay // Automatically play the animation
            loop // Loop the animation
            style={styles.lottieAnimation} // Style for the animation
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Crypto News</Text>
            <Text style={styles.headerSubtitle}>Community-powered sentiment analysis</Text>
          </View>
        </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.noResults}>No news available</Text>
            </View>
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  header: {
    backgroundColor: "#03A9F4",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    fontWeight: "700",
    color: "white",
    fontFamily: "Helvetica Neue",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Helvetica Neue",
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  circularImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  textContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  source: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  upvotes: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  downvotes: {
    fontSize: 12,
    color: "#F44336",
    fontWeight: "500",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  error: {
    color: "#F44336",
    fontSize: 16,
    textAlign: "center",
  },
  noResults: {
    color: "#666",
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sentimentContainer: {
    position: 'absolute',
    bottom: 20,  // Changed from top
    right: 8,   // Keep right alignment
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 6,
    borderRadius: 8,
    gap: 4,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
  },
  disabledVote: {
    opacity: 0.6,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  voteBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  voteBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  sentimentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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

export default NewsScreen;