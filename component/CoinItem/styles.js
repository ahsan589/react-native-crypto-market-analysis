import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  text: {
    color: "white",
    marginRight: 5,
  },
  coinContainer: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#282828",
    padding: 15,
    alignItems: "center",  // To ensure items are vertically centered
  },
  rank: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 12, // Set a consistent font size for the rank text
  },
  rankContainer: {
    backgroundColor: '#585858',
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 10,  // Increased margin to separate rank and symbol
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',  // Default color for percentage text, will be overridden by color condition in `CoinItem`
  },
  priceText: {
    color: "white",
    fontSize: 14,  // Adjusted font size for price to match design
    fontWeight: "bold",
  },
  marketCapText: {
    color: 'white',
    fontSize: 12,
  },
  image: {
    height: 30,
    width: 30,
    marginRight: 10,
    alignSelf: "center",
  },
});

export default styles;
