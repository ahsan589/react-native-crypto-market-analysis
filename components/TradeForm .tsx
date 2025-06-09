// components/TradeForm.tsx
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TradeFormProps {
  amount: number;
  setAmount: (amount: number) => void;
  tradeType: string;
  leverage: number;
  setLeverage: (leverage: number) => void;
  onSubmit: (type: 'buy' | 'sell') => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ amount, setAmount, tradeType, leverage, setLeverage, onSubmit }) => {
  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount.toString()}
        onChangeText={(text) => setAmount(parseFloat(text) || 0)}
        keyboardType="numeric"
      />
      {tradeType === 'future' && (
        <TextInput
          style={styles.input}
          placeholder="Leverage (e.g., 10x)"
          value={leverage.toString()}
          onChangeText={(text) => setLeverage(parseInt(text) || 1)}
          keyboardType="numeric"
        />
      )}
      <View style={styles.tradeButtons}>
        <TouchableOpacity style={styles.buyButton} onPress={() => onSubmit('buy')}>
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellButton} onPress={() => onSubmit('sell')}>
          <Text style={styles.buttonText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    color: '#333',
    marginBottom: 16,
  },
  tradeButtons: {
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

export default TradeForm;