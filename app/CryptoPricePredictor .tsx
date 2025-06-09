import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';

const CryptoPricePredictor = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [cryptoList, setCryptoList] = useState<{ id: string; name: string }[]>([]);
  const [filteredCryptoList, setFilteredCryptoList] = useState<{ id: string; name: string }[]>([]);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCoins, setFetchingCoins] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        let allData: any[] = [];
        const pages = 3;

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
        const coins = allData.map((coin: any) => ({
          id: coin.id,
          name: `${coin.name} (${coin.symbol.toUpperCase()})`,
        }));
        setCryptoList(coins);
        setFilteredCryptoList(coins);
      } catch (error) {
        console.error('API Error:', error);
        setError('Failed to fetch cryptocurrency list. Please try again later.');
      } finally {
        setFetchingCoins(false);
      }
    };

    fetchCryptoList();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = cryptoList.filter((crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCryptoList(filtered);
    } else {
      setFilteredCryptoList(cryptoList);
    }
  }, [searchQuery, cryptoList]);

  const handlePredict = async () => {
    if (!selectedCrypto) {
      setError('Please select a cryptocurrency.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPrediction(null);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  
    try {
      const response = await axios.post('http://192.168.43.28:5000/predict', {
        coinId: selectedCrypto,
      });
      setPrediction(response.data.prediction);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setError('Failed to fetch prediction. Please check your connection and try again.');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <LottieView
            source={require('../assets/lottie/spl.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>AI Crypto Predictor</Text>
            <Text style={styles.headerSubtitle}>Predict future crypto prices with AI-powered analysis</Text>
          </View>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Icon name="currency-bitcoin" size={24} color="#fff" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Select Cryptocurrency</Text>
        
        <TextInput
          style={styles.searchBar}
          placeholder="Search cryptocurrency..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text) {
              setSelectedCrypto('');
            }
          }}
        />

        <View style={styles.pickerContainer}>
          {fetchingCoins ? (
            <ActivityIndicator size="small" color="#03A9F4" />
          ) : (
            <Picker
              selectedValue={selectedCrypto}
              onValueChange={(itemValue) => setSelectedCrypto(itemValue)}
              style={styles.picker}
              dropdownIconColor="#03A9F4"
              mode="dropdown"
            >
              {filteredCryptoList.map((crypto) => (
                <Picker.Item
                  key={crypto.id}
                  label={crypto.name}
                  value={crypto.id}
                  color="#333"
                />
              ))}
            </Picker>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.predictButton, loading && styles.disabledButton]}
        onPress={handlePredict}
        disabled={loading || fetchingCoins || !selectedCrypto}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
            </>
          ) : (
            <>
              <Icon name="auto-awesome" size={20} color="#fff" />
              <Text style={styles.buttonText}>Predict Price</Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {error && (
        <Animated.View style={[styles.errorCard, { opacity: fadeAnim }]}>
          <LottieView
            source={require('../assets/lottie/error.json')} // Replace with your error animation
            autoPlay
            loop
            style={styles.errorAnimation}
          />
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      )}

      {prediction !== null && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>AI Price Prediction:</Text>
          <Text style={styles.predictionText}>
            {selectedCrypto.toUpperCase()} : ${prediction.toFixed(9)}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>⚠️This response is AI-generated, for reference only, and does not constitute professional advice.</Text>
          </View>
        </View>
      )}

      {loading && (
        <Animated.View style={[styles.loadingOverlay, { opacity: fadeAnim }]}>
          <LottieView
            source={require('../assets/lottie/spl.json')}
            autoPlay
            loop
            style={styles.lottieA}
          />
           <LottieView
            source={require('../assets/lottie/loading.json')}
            autoPlay
            loop
            style={styles.lottieAn}
          />
          
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  header: {
    backgroundColor: "#03A9F4",
    paddingVertical: 20,
    paddingHorizontal: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin:0,
    marginBottom: 24,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#ddd",
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    elevation: 24,
    shadowColor: '#00000010',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    color: '#03A9F4',
  },
  cardTitle: {
    color: '#424242',
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Poppins-Medium',
  },
  searchBar: {
    height: 40,
    borderColor: '#03A9F4',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    color: '#333',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 0.5,
    borderColor: '#03A9F4',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3eafe',
  },
  picker: {
    color: '#333',
    height: 50,
    backgroundColor: '#fff',
  },
  predictButton: {
    borderRadius: 14,
    backgroundColor: '#03A9F4',
    elevation: 6,
    shadowColor: '#03A9F440',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginVertical: 16,
  },
  buttonContent: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    elevation: 20,
    shadowColor: '#03A9F440',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultTitle: {
    color: '#4527a0',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-Medium',
  },
  predictionText: {
    color: '#03A9F4',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 12,
    fontFamily: 'Poppins-Bold',
    textShadowColor: '#03A9F420',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  metaText: {
    color: '#333',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#f0ecff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  errorCard: {
    backgroundColor: '#fff0f0',
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
    elevation: 2,
  },
  errorAnimation: {
    width: 90,
    height: 90,
    marginRight: 10,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
    fontFamily: 'Poppins-Medium',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#03A9F4',
    marginTop: 0,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  lottieA: {
    width: 200,
    height: 200,
  },
  lottieAn:{
    marginTop: -20,
    width: 150,
    height: 30,

  }
});

export default CryptoPricePredictor;