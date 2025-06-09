import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native'; // Import Lottie

type Exchange = {
  id: string;
  name: string;
  trust_score: number | null;
  image: string;
  market_url: string;
  trade_volume_24h_btc: number | null;
};

const ExchangesScreen = ({ navigation }: any) => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/exchanges');
        setExchanges(response.data.slice(0, 100)); // Limit to 100 exchanges
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch exchanges.');
        setLoading(false);
      }
    };

    fetchExchanges();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = (exchangeId: string) => {
    navigation.navigate('ExchangeDetailsScreen', { exchangeId });
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
       <LottieView
                source={require("../assets/lottie/error.json")} // Path to your Lottie JSON file
                autoPlay // Automatically play the animation
                loop // Loop the animation
                style={styles.lottieAnimation} // Style for the animation
              />
    return <Text style={styles.error}>{error}</Text>;
  }

  const renderExchangeItem = ({ item, index }: { item: Exchange; index: number }) => {
    const volume = item.trade_volume_24h_btc
      ? `${item.trade_volume_24h_btc.toLocaleString()} BTC`
      : 'N/A';

    return (
      <TouchableOpacity onPress={() => handlePress(item.id)}>
        <Animated.View style={[styles.itemContainer, { opacity: fadeAnim }]}>
          <View style={styles.exchangeInfo}>
            <Text style={styles.index}>{index + 1}</Text>
            <Image
              source={{ uri: item.image }}
              style={styles.exchangeImage}
              onError={() => console.error(`Failed to load image for ${item.id}`)}
            />
            <View style={styles.exchangeDetails}>
              <Text style={styles.exchangeName}>{item.name}</Text>
              <Text style={styles.trustLevel}>
                Trust Level: {item.trust_score !== null ? item.trust_score : 'N/A'}/10
              </Text>
              <Text style={styles.volume}>24h Volume: {volume}</Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require('../assets/lottie/exec.json')} // Lottie JSON file
            autoPlay // Automatically play the animation
            loop // Loop the animation
            style={styles.lottieAnimation} // Style for the animation
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Exchanges</Text>
            <Text style={styles.headerSubtitle}>Top 100 Crypto Exchanges</Text>
          </View>
        </View>
      </View>

      {/* Exchange List */}
      <FlatList
        data={exchanges}
        keyExtractor={(item) => item.id}
        renderItem={renderExchangeItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#03A9F4',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row', // Align animation and title horizontally
    alignItems: 'center', // Center items vertically
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
  lottieAnimation: {
    width: 60, // Adjust size as needed
    height: 60, // Adjust size as needed
    marginRight: 10, // Add spacing between animation and title
  },
  headerTextContainer: {
    flexDirection: 'column', // Stack title and subtitle vertically
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 50,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exchangeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  index: {
    width: '10%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  exchangeImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 16,
  },
  exchangeDetails: {
    flex: 1,
  },
  exchangeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  trustLevel: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  volume: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
});

export default ExchangesScreen;