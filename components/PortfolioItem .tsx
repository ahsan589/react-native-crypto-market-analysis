// components/PortfolioItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PortfolioItemProps {
  crypto: {
    name: string;
    symbol: string;
  };
  quantity: number;
  currentValue: number;
  leverage?: number;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ crypto, quantity, currentValue, leverage }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.cryptoName}>
        {crypto.name} ({crypto.symbol.toUpperCase()})
      </Text>
      <Text style={styles.cryptoPrice}>Quantity: {quantity}</Text>
      {leverage && <Text style={styles.cryptoPrice}>Leverage: {leverage}x</Text>}
      <Text style={styles.cryptoPrice}>Current Value: ${currentValue.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default PortfolioItem;