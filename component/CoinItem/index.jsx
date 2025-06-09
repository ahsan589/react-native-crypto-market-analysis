import React from "react";
import { Text, View, Image, Pressable, StyleSheet, Animated } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CoinItem = ({ marketCoin }) => {
  const {
    id,
    name,
    current_price,
    market_cap_rank,
    price_change_percentage_24h,
    symbol,
    market_cap,
    image,
  } = marketCoin;

  const navigation = useNavigation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const percentageColor = price_change_percentage_24h < 0 ? "#ea3943" : "#16c784";

  const normalizeMarketCap = (marketCap) => {
    if (marketCap > 1e12) {
      return `${(marketCap / 1e12).toFixed(3)} T`;
    }
    if (marketCap > 1e9) {
      return `${(marketCap / 1e9).toFixed(3)} B`;
    }
    if (marketCap > 1e6) {
      return `${(marketCap / 1e6).toFixed(3)} M`;
    }
    if (marketCap > 1e3) {
      return `${(marketCap / 1e3).toFixed(3)} K`;
    }
    return marketCap;
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
        style={styles.coinContainer}
        onPress={() => navigation.navigate("CoinDetailedScreen", { coinId: id })}
      >
        <View style={styles.coinInfoContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <View>
            <Text style={styles.title}>{name}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
           
              <Text style={styles.text}>{symbol.toUpperCase()}</Text>
              <AntDesign
                name={price_change_percentage_24h < 0 ? "caretdown" : "caretup"}
                size={12}
                color={percentageColor}
                style={{ marginRight: 5 }}
              />
              <Text style={{ color: percentageColor, fontFamily: "Times New Roman" }}>
                {price_change_percentage_24h?.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.coinDetails}>
          <Text style={styles.title}>${current_price?.toFixed(2)}</Text>
          <Text style={styles.marketCap}>MCap {normalizeMarketCap(market_cap)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  coinContainer: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
    padding: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coinInfoContainer: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  image: {
    height: 40,
    width: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  title: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 3,
    fontFamily: "Times New Roman",
  },
  text: {
    color: "#666",
    marginRight: 5,
    fontFamily: "Times New Roman",
  },
  rank: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 12,
    fontFamily: "Times New Roman",
  },
  rankContainer: {
    backgroundColor: "#585858",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    marginRight: 10,
  },
  coinDetails: {
    marginLeft: "auto",
    alignItems: "flex-end",
  },
  marketCap: {
    color: "#666",
    fontSize: 14,
    fontFamily: "Times New Roman",
  },
});

export default CoinItem;