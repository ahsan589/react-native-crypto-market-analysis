import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 32) / 2;

class PlatformModel {
  constructor(
    public name: string,
    public url: string
  ) {}
}

const SocialTradingScreen = () => {
  const [platforms, setPlatforms] = useState<PlatformModel[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformModel | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  useEffect(() => {
    const initialPlatforms = [
      new PlatformModel("TradingView", "https://www.tradingview.com/ideas/"),
      new PlatformModel("eToro", "https://www.etoro.com/discover/markets/cryptocurrencies"),
      new PlatformModel("Binance Social", "https://www.binance.com/en/feed"),
      new PlatformModel("CoinMarketCap Community", "https://coinmarketcap.com/community/"),
      new PlatformModel("Zignaly", "https://zignaly.com/#top-traders"),
      new PlatformModel("3Commas", "https://3commas.io/signal-bot"),
      new PlatformModel("Shrimpy", "https://www.shrimpy.io/"),
      new PlatformModel("Bitcointalk", "https://bitcointalk.org/"),
      new PlatformModel("CoinSpectator", "https://coinspectator.com/")
    ];

    setPlatforms(initialPlatforms);
  }, []);

  const handlePlatformPress = (platform: PlatformModel) => {
    setSelectedPlatform(platform);
    setWebViewKey(prev => prev + 1);
    setShowWebView(true);
  };

  const PlatformItem = ({ platform }: { platform: PlatformModel }) => {
    const getPlatformIcon = () => {
      const iconMap: { [key: string]: string } = {
        'TradingView': 'chart-line',
        'eToro': 'account-group',
        'Binance Social': 'currency-btc',
        '3Commas': 'robot',
        'Shrimpy': 'shield-account',
        'Bitcointalk': 'forum',
        'CoinSpectator': 'newspaper',
        'Zignaly': 'chart-bell-curve-cumulative'
      };

      return iconMap[platform.name] || 'web';
    };

    return (
      <TouchableOpacity 
        style={[styles.platformItem, { width: ITEM_WIDTH }]}
        onPress={() => handlePlatformPress(platform)}
        activeOpacity={0.7}
      >
        <View style={styles.platformIconContainer}>
          <MaterialCommunityIcons 
            name={getPlatformIcon()}
            size={42}
            color="#03A9F4"
          />
        </View>
        <Text style={styles.platformName} numberOfLines={2}>
          {platform.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (showWebView && selectedPlatform) {
    return (
      <SafeAreaView style={styles.flexContainer}>
        <WebView
          key={webViewKey}
          source={{ uri: selectedPlatform.url }}
          style={styles.flexContainer}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#03A9F4" />
            </View>
          )}
        />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowWebView(false)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require('../assets/lottie/bin.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Crypto Social Platforms</Text>
            <Text style={styles.headerSubtitle}>Access leading crypto communities</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={platforms}
        renderItem={({ item }) => <PlatformItem platform={item} />}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#03A9F4',
    fontWeight: '500',
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
  },
  listContainer: {
    padding: 8
  },
  columnWrapper: {
    justifyContent: 'space-between'
  },
  platformItem: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    })
  },
  platformIconContainer: {
    position: 'relative',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F3EDF7',
    borderRadius: 20
  },
  platformName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 4
  },
  backButton: {
    position: 'absolute',
    top: Platform.select({ ios: 40, android: 16 }),
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1
  }
});

export default SocialTradingScreen;