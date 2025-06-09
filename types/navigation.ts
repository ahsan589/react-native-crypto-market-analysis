import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  CoinDetailedScreen: { coinId: string }; // Use "CoinDetailedScreen" as the screen name
  WatchlistScreen: undefined; // Use "WatchlistScreen" as the screen name
};

// Define the type for the navigation prop in WatchlistScreen
export type WatchlistScreenNavigationProp = StackNavigationProp<RootStackParamList, "WatchlistScreen">;