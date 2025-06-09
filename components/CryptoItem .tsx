// components/CryptoItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Crypto {
  name: string;
  symbol: string;
  current_price: number;
}

interface CryptoItemProps {
  crypto: Crypto;
  onBuy: () => void;
  onSell: () => void;
}

const CryptoItem: React.FC<CryptoItemProps> = ({ crypto, onBuy, onSell }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.cryptoName}>
        {crypto.name} ({crypto.symbol.toUpperCase()})
      </Text>
      <Text style={styles.cryptoPrice}>Price: ${crypto.current_price}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellButton} onPress={onSell}>
          <Text style={styles.buttonText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cryptoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cryptoPrice: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  buyButton: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  sellButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CryptoItem;