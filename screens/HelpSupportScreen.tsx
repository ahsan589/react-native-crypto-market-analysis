import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import LottieView from 'lottie-react-native'; // Import Lottie
import { Alert } from 'react-native';
import { Linking } from 'react-native';

const HelpAndSupportScreen = ({ navigation }: any) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'app_related',
      title: 'App-Related Questions',
      icon: 'mobile-alt',
      data: [
        { question: 'How to add a coin to my watchlist?', answer: 'Simply navigate to the coin details page and tap the "Add to Watchlist" button.' },
        { question: 'How do I set up alerts?', answer: 'Go to the settings menu, select ‘Price Alerts’, and choose the coin and price threshold for the alert.' },
        { question: 'Is my data secure?', answer: 'Yes, we use industry-standard encryption and authentication methods to secure your data.' },
      ],
    },
    {
      id: 'knowledge_base',
      title: 'Crypto Knowledge Base',
      icon: 'book-open',
      data: [
        { question: 'What is cryptocurrency?', answer: 'Cryptocurrency is a digital currency that uses cryptography for security and operates on decentralized networks.' },
        { question: 'How does blockchain work?', answer: 'Blockchain is a distributed ledger that records transactions across multiple computers securely and transparently.' },
        { question: 'How do I buy cryptocurrency?', answer: 'You can buy cryptocurrency on exchanges like Binance, Coinbase, and Kraken using fiat currency or other cryptocurrencies.' },
        { question: 'What is market analysis?', answer: 'Market analysis involves studying past and current trends to predict future price movements.' },
        { question: 'Which trends should I follow?', answer: 'Traders often follow trends like Moving Averages, RSI, and MACD for signals on market movements.' },
        { question: 'What is spot trading?', answer: 'Spot trading involves buying or selling assets for immediate delivery at current market prices.' },
        { question: 'What is futures trading?', answer: 'Futures trading is a contract-based trading method where you agree to buy or sell an asset at a predetermined future date and price.' },
        { question: 'How do candlestick charts work?', answer: 'Candlestick charts display price movements over time, showing open, close, high, and low prices for each period.' },
        { question: 'What is a bullish trend?', answer: 'A bullish trend indicates rising prices and increasing investor confidence in an asset.' },
        { question: 'What is a bearish trend?', answer: 'A bearish trend signifies falling prices and declining investor confidence.' },
        { question: 'How to identify support and resistance levels?', answer: 'Support is the price level where buying pressure prevents further decline, while resistance is where selling pressure prevents further rise.' },
        { question: 'What is RSI (Relative Strength Index)?', answer: 'RSI is a momentum indicator that measures overbought and oversold conditions in the market.' },
        { question: 'What is MACD (Moving Average Convergence Divergence)?', answer: 'MACD helps identify changes in the strength, direction, momentum, and duration of a trend.' },
        { question: 'What is Bollinger Bands?', answer: 'Bollinger Bands measure volatility and indicate overbought/oversold conditions.' },
        { question: 'How do I interpret volume in crypto trading?', answer: 'Higher trading volume often confirms the strength of a trend, while lower volume can indicate weakness or trend reversals.' },
        { question: 'What is a stop-loss order?', answer: 'A stop-loss order automatically sells an asset when it reaches a predetermined price to minimize losses.' },
        { question: 'What is leverage trading?', answer: 'Leverage allows traders to borrow funds to increase their position size, amplifying both potential gains and losses.' },
        { question: 'How to avoid liquidation in futures trading?', answer: 'Avoid over-leveraging, use stop-loss orders, and maintain sufficient margin balance.' },
        { question: 'What are common crypto trading strategies?', answer: 'Common strategies include day trading, swing trading, scalping, and HODLing.' },
      ],
    },
    {
      id: 'general_inquiries',
      title: 'General Inquiries',
      icon: 'lightbulb',
      data: [
        { question: 'Can you add a dark mode feature?', answer: 'Thank you for the suggestion! We are considering adding a dark mode in future updates.' },
        { question: 'Can I request a new coin to be listed?', answer: 'Yes, you can submit a request via our feedback form in the settings menu.' },
        { question: 'Will there be more trading tools in the future?', answer: 'We are working on adding more advanced trading tools soon.' },
      ],
    },
  ];

  const toggleSection = (sectionId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.question}>{item.question}</Text>
      <Text style={styles.answer}>{item.answer}</Text>
    </View>
  );
  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "How would you like to contact support?",
      [
        {
          text: "Email",
          onPress: () => Linking.openURL('mailto:cryptoinsight4198@gmail.com?subject=Support Request'),
        },
        {
          text: "Phone",
          onPress: () => Linking.openURL('tel:+923101788571'),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>
      {/* Header with Lottie Animation */}
      <View style={styles.header}>
        <LottieView
          source={require('../assets/lottie/hel.json')} // Lottie JSON file
          autoPlay // Automatically play the animation
          loop // Loop the animation
          style={styles.lottieAnimation} // Style for the animation
        />
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      {/* Sections */}
      {sections.map((section) => (
        <View key={section.id}>
          <TouchableOpacity
            style={styles.sectionCard}
            onPress={() => toggleSection(section.id)}
            activeOpacity={0.8}
          >
            <FontAwesome5 name={section.icon} size={20} color="#fff" style={styles.icon} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <FontAwesome5
              name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#fff"
              style={styles.chevron}
            />
          </TouchableOpacity>
          {expandedSection === section.id && (
            <FlatList
              data={section.data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              scrollEnabled={false}
            />
          )}
        </View>
      ))}

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleContactSupport}>
      <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lottieAnimation: {
    width: 120, // Adjust size as needed
    height: 120, // Adjust size as needed
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
  },
  sectionCard: {
    backgroundColor: '#03A9F4',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  chevron: {
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    marginHorizontal:6,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  answer: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  backButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HelpAndSupportScreen;