

export type RootStackParamList = {
  HomeScreen: undefined;
  CryptoScreen: undefined;
  ExchangesScreen: undefined;
  CryptoPricePredictor: undefined;
  DemiScreen: undefined;
  ProfileScreen: undefined;
  Market: undefined;
  PriceAlert: undefined;
CoinDetailedScreen: { coinId: string };
VideoScreen: undefined;
NewsScreen: undefined;
NewsDetail: { item: NewsItem };
WatchlistScreen: undefined;
Login: undefined;
signup:undefined;
ForgotPassword: undefined;
ResetPasswordScreen: { email: string };
SocialTradingScreen: undefined;
// navigationTypes.ts

};

export type NewsItem = {
    id: string;
    guid: string;
    published_on: number;
    imageurl: string;
    title: string;
    url: string;
    body: string;
    tags: string;
    lang: string;
    upvotes: number;
    downvotes: number;
    categories: string;
    source_info: {
      name: string;
      img: string;
      lang: string;
    };
    source: string;
  };



