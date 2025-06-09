import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import PushNotification from 'react-native-push-notification';

PushNotification.createChannel(
    {
      channelId: "price-alerts", // Same as used in the notification config
      channelName: "Price Alert Notifications",
      channelDescription: "Notifications for cryptocurrency price alerts",
      soundName: "default",
      importance: 4, // Importance value for high priority notifications
      vibrate: true,
    },
    (created) => console.log(`Channel created: ${created ? 'Yes' : 'No'}`) // Callback
  );
  

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
}

interface PriceAlert {
  id: string;
  coinName: string;
  coinSymbol: string;
  coinId: string;
  targetPrice: number;
  alertType: string;
  createdAt: number;
}

const ALERTS_STORAGE_KEY = 'PRICE_ALERTS';
const { height } = Dimensions.get('window');

const PriceAlertScreen = () => {
  const [selectedCoin, setSelectedCoin] = useState<string>('');
  const [cryptoList, setCryptoList] = useState<Coin[]>([]);
  const [filteredCryptoList, setFilteredCryptoList] = useState<Coin[]>([]);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [alertType, setAlertType] = useState<string>('Above');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [fetchingCoins, setFetchingCoins] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Initialize push notifications
  useEffect(() => {
    PushNotification.configure({
      onRegister: function(token) {
        console.log("Device Token:", token);
      },
      onNotification: function(notification) {
        console.log("Notification Received:", notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Clean up on unmount
    return () => {
      PushNotification.removeAllDeliveredNotifications();
    };
  }, []);

  // Demo push notification every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (alerts.length > 0) {
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        showPushNotification(
          'Price Alert Triggered',
          `${randomAlert.coinName} (${randomAlert.coinSymbol}) is now $${randomAlert.targetPrice.toFixed(2)}`,
          randomAlert.id
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [alerts]);

  const showPushNotification = (title: string, message: string, alertId?: string) => {
    PushNotification.localNotification({
      title: title,
      message: message,
      channelId: 'price-alerts',
      playSound: true,
      soundName: 'default',
      userInfo: { alertId: alertId },
    });
  };

  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 100,
            page: 1,
          },
        });
        setCryptoList(response.data);
        setFilteredCryptoList(response.data);
      } catch (error) {
        console.error('API Error:', error);
        setError('Failed to fetch cryptocurrency list. Please try again later.');
      } finally {
        setFetchingCoins(false);
      }
    };

    fetchCryptoList();
    loadAlerts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = cryptoList.filter((crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCryptoList(filtered);
    } else {
      setFilteredCryptoList(cryptoList);
    }
  }, [searchQuery, cryptoList]);

  useEffect(() => {
    if (selectedCoin) {
      const coin = cryptoList.find(c => c.id === selectedCoin);
      if (coin) {
        setCurrentPrice(coin.current_price);
      }
    }
  }, [selectedCoin, cryptoList]);

  const loadAlerts = async () => {
    try {
      const savedAlerts = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      if (savedAlerts) {
        const parsedAlerts = JSON.parse(savedAlerts);
        setAlerts(parsedAlerts);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const saveAlerts = async (newAlerts: PriceAlert[]) => {
    try {
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  };

  const setPriceAlert = () => {
    if (!selectedCoin || !targetPrice) {
      setError('Please select a coin and enter a target price.');
      return;
    }

    const selected = cryptoList.find(coin => coin.id === selectedCoin);
    if (!selected) return;

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      coinName: selected.name,
      coinSymbol: selected.symbol.toUpperCase(),
      coinId: selected.id,
      targetPrice: parseFloat(targetPrice),
      alertType,
      createdAt: Date.now(),
    };

    const updatedAlerts = [...alerts, newAlert];
    saveAlerts(updatedAlerts);
    setTargetPrice('');
    setError(null);
    
    // Show push notification
    showPushNotification(
      'Alert Created',
      `Price alert set for ${selected.name} (${selected.symbol.toUpperCase()})`,
      newAlert.id
    );
  };

  const removeAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    saveAlerts(updatedAlerts);
    showPushNotification(
      'Alert Removed',
      'Price alert was successfully removed',
      id
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAlertItem = ({ item }: { item: PriceAlert }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertInfo}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertCoin}>{item.coinName} ({item.coinSymbol})</Text>
          <Text style={styles.alertTime}>{formatDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.alertDetails}>
          Alert when price is {item.alertType.toLowerCase()} ${item.targetPrice.toFixed(6)}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => removeAlert(item.id)}
        style={styles.deleteButton}
      >
        <Icon name="delete" size={24} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <LottieView
              source={require('../assets/lottie/noti.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Price Alerts</Text>
              <Text style={styles.headerSubtitle}>Get notified when prices hit your targets</Text>
            </View>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Alert</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchBar}
              placeholder="Search cryptocurrency..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <Icon name="close" size={20} color="#888" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.pickerContainer}>
            {fetchingCoins ? (
              <ActivityIndicator size="small" color="#6200ee" />
            ) : (
              <Picker
                selectedValue={selectedCoin}
                onValueChange={setSelectedCoin}
                style={styles.picker}
              >
                <Picker.Item label="Select a cryptocurrency..." value="" />
                {filteredCryptoList.map((crypto) => (
                  <Picker.Item
                    key={crypto.id}
                    label={`${crypto.name} (${crypto.symbol.toUpperCase()})`}
                    value={crypto.id}
                  />
                ))}
              </Picker>
            )}
          </View>

          {currentPrice !== null && (
            <View style={styles.priceContainer}>
              <Text style={styles.currentPriceLabel}>Current Price:</Text>
              <Text style={styles.currentPriceValue}>
                ${currentPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8
                })}
              </Text>
            </View>
          )}

          <View style={styles.alertTypeContainer}>
            <Text style={styles.alertTypeLabel}>Alert Type:</Text>
            <View style={styles.alertTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.alertTypeButton,
                  alertType === 'Above' && styles.alertTypeButtonActive
                ]}
                onPress={() => setAlertType('Above')}
              >
                <Icon 
                  name="arrow-upward" 
                  size={16} 
                  color={alertType === 'Above' ? '#fff' : '#6200ee'} 
                  style={styles.alertTypeIcon} 
                />
                <Text style={[
                  styles.alertTypeButtonText,
                  alertType === 'Above' && styles.alertTypeButtonTextActive
                ]}>
                  Above
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.alertTypeButton,
                  alertType === 'Below' && styles.alertTypeButtonActive
                ]}
                onPress={() => setAlertType('Below')}
              >
                <Icon 
                  name="arrow-downward" 
                  size={16} 
                  color={alertType === 'Below' ? '#fff' : '#6200ee'} 
                  style={styles.alertTypeIcon} 
                />
                <Text style={[
                  styles.alertTypeButtonText,
                  alertType === 'Below' && styles.alertTypeButtonTextActive
                ]}>
                  Below
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.priceInputContainer}>
            <Text style={styles.priceInputLabel}>Target Price (USD):</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor="#888"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.setAlertButton,
              (!selectedCoin || !targetPrice) && styles.disabledButton
            ]}
            onPress={setPriceAlert}
            disabled={!selectedCoin || !targetPrice}
          >
            <Icon name="add-alert" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Set Price Alert</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Icon name="error-outline" size={24} color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.alertsContainer}>
          <View style={styles.alertsHeader}>
            <Text style={styles.alertsTitle}>Your Active Alerts</Text>
            <Text style={styles.alertsCount}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</Text>
          </View>

          {alerts.length === 0 ? (
            <View style={styles.emptyAlerts}>
              <Icon name="notifications-off" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No active price alerts</Text>
              <Text style={styles.emptySubtext}>Set your first alert above</Text>
            </View>
          ) : (
            <FlatList
              data={alerts}
              renderItem={renderAlertItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              style={styles.alertsList}
              contentContainerStyle={styles.alertsListContent}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#6200ea",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    elevation: 4,
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
    flex: 1,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  clearSearchButton: {
    padding: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  currentPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  currentPriceValue: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: 'bold',
  },
  alertTypeContainer: {
    marginBottom: 16,
  },
  alertTypeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alertTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  alertTypeButtonActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  alertTypeIcon: {
    marginRight: 6,
  },
  alertTypeButtonText: {
    color: '#666',
  },
  alertTypeButtonTextActive: {
    color: '#fff',
  },
  priceInputContainer: {
    marginBottom: 16,
  },
  priceInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  setAlertButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
  },
  alertsContainer: {
    marginHorizontal: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  alertsCount: {
    fontSize: 14,
    color: '#666',
  },
  alertsList: {
    maxHeight: height * 0.4,
  },
  alertsListContent: {
    paddingBottom: 20,
  },
  alertItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  alertInfo: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertCoin: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertTime: {
    fontSize: 12,
    color: '#888',
  },
  alertDetails: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  emptyAlerts: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default PriceAlertScreen;