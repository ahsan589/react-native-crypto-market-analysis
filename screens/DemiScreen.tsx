// screens/DemiScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoItem from '@/components/CryptoItem ';
import TradeForm from '@/components/TradeForm ';
import PortfolioItem from '@/components/PortfolioItem ';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Crypto {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: number;
  readonly market_cap: number;
  readonly image?: string;
  readonly price_change_percentage_24h?: number;
}

interface PortfolioItem {
  quantity: number;
  buyPrice?: number;
  entryPrice?: number;
  leverage?: number;
}

interface Portfolio {
  [key: string]: PortfolioItem;
}

type TradeType = 'spot' | 'future';

const DemiScreen = () => {
  const [userBalance, setUserBalance] = useState(100000);
  const [spotPortfolio, setSpotPortfolio] = useState<Portfolio>({});
  const [futurePortfolio, setFuturePortfolio] = useState<Portfolio>({});
  const [cryptoData, setCryptoData] = useState<Crypto[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [currentPage, setCurrentPage] = useState<'market' | 'buy-sell' | 'portfolio'>('market');
  const [amount, setAmount] = useState<number | string>('');
  const [tradeType, setTradeType] = useState<TradeType>('spot');
  const [leverage, setLeverage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const balance = await AsyncStorage.getItem('userBalance');
        const spot = await AsyncStorage.getItem('spotPortfolio');
        const future = await AsyncStorage.getItem('futurePortfolio');

        if (balance) setUserBalance(parseFloat(balance));
        if (spot) setSpotPortfolio(JSON.parse(spot));
        if (future) setFuturePortfolio(JSON.parse(future));
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data.');
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('userBalance', userBalance.toString());
        await AsyncStorage.setItem('spotPortfolio', JSON.stringify(spotPortfolio));
        await AsyncStorage.setItem('futurePortfolio', JSON.stringify(futurePortfolio));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [userBalance, spotPortfolio, futurePortfolio]);

  // Fetch cryptocurrency data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';
        const response = await fetch(url);
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setError('Failed to fetch cryptocurrency data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  // Periodically update crypto prices
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoData((prevData) => [...prevData]);
    }, 30000); // Fetch every 60 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Handle trade submission
  const handleTradeSubmit = (amount: number | string, action: 'buy' | 'sell') => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Amount must be greater than 0.');
      return;
    }

    if (!selectedCrypto) {
      Alert.alert('Error', 'No cryptocurrency selected.');
      return;
    }

    const cryptoPrice = selectedCrypto.current_price;
    const cost = numericAmount * cryptoPrice;

    if (action === 'buy') {
      if (cost > userBalance) {
        Alert.alert('Insufficient Balance', 'You do not have enough funds to complete this trade.');
        return;
      }

      setUserBalance((prevBalance) => prevBalance - cost);

      if (tradeType === 'spot') {
        setSpotPortfolio((prevPortfolio) => ({
          ...prevPortfolio,
          [selectedCrypto.id]: {
            quantity: (prevPortfolio[selectedCrypto.id]?.quantity || 0) + numericAmount,
            buyPrice: (prevPortfolio[selectedCrypto.id]?.buyPrice || 0) + cost,
          },
        }));
      } else {
        setFuturePortfolio((prevPortfolio) => ({
          ...prevPortfolio,
          [selectedCrypto.id]: {
            quantity: (prevPortfolio[selectedCrypto.id]?.quantity || 0) + numericAmount,
            entryPrice: cryptoPrice,
            leverage: leverage,
          },
        }));
      }
    } else {
      if (tradeType === 'spot') {
        const currentHolding = spotPortfolio[selectedCrypto.id];
        if (!currentHolding || currentHolding.quantity < numericAmount) {
          Alert.alert('Insufficient Holdings', 'You do not have enough cryptocurrency to sell.');
          return;
        }

        setUserBalance((prevBalance) => prevBalance + cost);
        setSpotPortfolio((prevPortfolio) => {
          const updatedQuantity = currentHolding.quantity - numericAmount;
          const updatedBuyPrice = (currentHolding.buyPrice || 0) - ((currentHolding.buyPrice || 0) / currentHolding.quantity) * numericAmount;

          if (updatedQuantity === 0) {
            const { [selectedCrypto.id]: _, ...rest } = prevPortfolio;
            return rest;
          } else {
            return {
              ...prevPortfolio,
              [selectedCrypto.id]: {
                quantity: updatedQuantity,
                buyPrice: updatedBuyPrice,
              },
            };
          }
        });
      } else {
        const currentHolding = futurePortfolio[selectedCrypto.id];
        if (!currentHolding || currentHolding.quantity < numericAmount) {
          Alert.alert('Insufficient Holdings', 'You do not have enough cryptocurrency to sell.');
          return;
        }

        setUserBalance((prevBalance) => prevBalance + cost);
        setFuturePortfolio((prevPortfolio) => {
          const updatedQuantity = currentHolding.quantity - numericAmount;

          if (updatedQuantity === 0) {
            const { [selectedCrypto.id]: _, ...rest } = prevPortfolio;
            return rest;
          } else {
            return {
              ...prevPortfolio,
              [selectedCrypto.id]: {
                quantity: updatedQuantity,
                entryPrice: currentHolding.entryPrice,
                leverage: currentHolding.leverage,
              },
            };
          }
        });
      }
    }

    Alert.alert('Trade Successful', `${action === 'buy' ? 'Buy' : 'Sell'} order executed successfully.`);
    setCurrentPage('market');
  };

  // Calculate total portfolio value
  const calculatePortfolioValue = (portfolio: Portfolio) => {
    return Object.entries(portfolio).reduce((total, [cryptoId, data]) => {
      const crypto = cryptoData.find((c) => c.id === cryptoId);
      if (crypto) {
        return total + data.quantity * crypto.current_price * (data.leverage || 1);
      }
      return total;
    }, 0);
  };

  // Render Market Page
  const renderMarketPage = () => (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <Text style={styles.sectionTitle}>Market Overview</Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>Total Balance: ${userBalance.toFixed(2)}</Text>
        <Text style={styles.balanceText}>Available Funds: ${userBalance.toFixed(2)}</Text>
      </View>
      <View style={styles.tradeTypeContainer}>
        <TouchableOpacity
          style={[styles.tradeTypeButton, tradeType === 'spot' && styles.activeTradeTypeButton]}
          onPress={() => setTradeType('spot')}
        >
          <Text style={styles.tradeTypeButtonText}>Spot</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tradeTypeButton, tradeType === 'future' && styles.activeTradeTypeButton]}
          onPress={() => setTradeType('future')}
        >
          <Text style={styles.tradeTypeButtonText}>Future</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#03A9F4" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        cryptoData.map((crypto) => (
          <CryptoItem
            key={crypto.id}
            crypto={crypto}
            onBuy={() => {
              setSelectedCrypto(crypto);
              setCurrentPage('buy-sell');
            }}
            onSell={() => {
              setSelectedCrypto(crypto);
              setCurrentPage('buy-sell');
            }}
          />
        ))
      )}
    </ScrollView>
  );

  // Render Buy/Sell Page
  const renderBuySellPage = () => {
    if (!selectedCrypto) return null;

    const chartUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=${selectedCrypto.symbol}USD&interval=1D&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=1&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=Light&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=coinmarketcap.com&utm_medium=widget&utm_campaign=chart&utm_term=${selectedCrypto.symbol}USDT`;

    return (
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentPage('market')}>
          <Text style={styles.backButtonText}>← Back to Market</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>
          {tradeType === 'spot' ? 'Spot' : 'Future'} Trade - {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
        </Text>
        <Text style={styles.cryptoPrice}>Price: ${selectedCrypto.current_price.toLocaleString()}</Text>
        <Text style={styles.cryptoMarketCap}>Market Cap: ${selectedCrypto.market_cap.toLocaleString()}</Text>

        <View style={styles.chartContainer}>
          <WebView
            source={{ uri: chartUrl }}
            style={styles.chart}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        <TradeForm
          amount={typeof amount === 'string' ? parseFloat(amount) : amount}
          setAmount={setAmount}
          tradeType={tradeType}
          leverage={leverage}
          setLeverage={setLeverage}
          onSubmit={(action: 'buy' | 'sell') => handleTradeSubmit(amount, action)}
        />
      </ScrollView>
    );
  };

  // Render Portfolio Page
  const renderPortfolioPage = () => {
    const totalSpotValue = calculatePortfolioValue(spotPortfolio);
    const totalFutureValue = calculatePortfolioValue(futurePortfolio);

    const spotItems = Object.entries(spotPortfolio).map(([cryptoId, data]) => {
      const crypto = cryptoData.find((c) => c.id === cryptoId);
      if (crypto) {
        const currentValue = data.quantity * crypto.current_price;

        return (
          <PortfolioItem
            key={cryptoId}
            crypto={crypto}
            quantity={data.quantity}
            currentValue={currentValue}
          />
        );
      }
      return null;
    });

    const futureItems = Object.entries(futurePortfolio).map(([cryptoId, data]) => {
      const crypto = cryptoData.find((c) => c.id === cryptoId);
      if (crypto) {
        const currentValue = data.quantity * crypto.current_price * (data.leverage || 1);

        return (
          <PortfolioItem
            key={cryptoId}
            crypto={crypto}
            quantity={data.quantity}
            currentValue={currentValue}
            leverage={data.leverage}
          />
        );
      }
      return null;
    });

    return (
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentPage('market')}>
          <Text style={styles.backButtonText}>← Back to Market</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        <Text style={styles.cryptoPrice}>Balance: ${userBalance.toFixed(2)}</Text>

        <Text style={styles.sectionTitle}>Spot Holdings</Text>
        <Text style={styles.cryptoPrice}>Total Spot Value: ${totalSpotValue.toFixed(2)}</Text>
        <View style={styles.portfolioList}>{spotItems}</View>

        <Text style={styles.sectionTitle}>Future Holdings</Text>
        <Text style={styles.cryptoPrice}>Total Future Value: ${totalFutureValue.toFixed(2)}</Text>
        <View style={styles.portfolioList}>{futureItems}</View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crypto Trading Platform</Text>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => setCurrentPage('market')}>
            <Text style={styles.navLink}>Market</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentPage('portfolio')}>
            <Text style={styles.navLink}>Portfolio</Text>
          </TouchableOpacity>
        </View>
      </View>

      {currentPage === 'market' && renderMarketPage()}
      {currentPage === 'buy-sell' && renderBuySellPage()}
      {currentPage === 'portfolio' && renderPortfolioPage()}
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
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  nav: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  navLink: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pageContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#03A9F4',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceText: {
    fontSize: 16,
    color: '#333',
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tradeTypeButton: {
    flex: 1,
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTradeTypeButton: {
    backgroundColor: '#03A9F4',
  },
  tradeTypeButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginTop: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#03A9F4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cryptoPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  cryptoMarketCap: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  chartContainer: {
    height: 300,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
  },
  chart: {
    flex: 1,
    
  },
  portfolioList: {
    gap: 16,
  },
});

export default DemiScreen;