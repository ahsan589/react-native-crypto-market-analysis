import axios from "axios";

export const getDetailedCoinData = async (coinId) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false`)
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

export const getCoinMarketChart = async (coinId, selectedRange) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${selectedRange}&interval=hourly`)
    return response.data;
  } catch (e) {
    console.log(e)
  }
}

export const getMarketData = async (pageCount = 5) => {
  try {
    let allData = [];

    // Loop through multiple pages
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${pageNumber}&sparkline=false&price_change_percentage=24h`
      );

      // Add the data from the current page to the allData array
      allData = [...allData, ...response.data];
    }

    return allData;
  } catch (e) {
    console.error("Error fetching market data:", e);
    return []; // Return an empty array in case of error
  }
};

export const getWatchlistedCoins = async (pageNumber = 1, coinIds) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=50&page=${pageNumber}&sparkline=false&price_change_percentage=24h`);
    return response.data;
  } catch (e) {
    console.log(e);
  }
}

export const getAllCoins = async () => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/list?include_platform=false`)
    return response.data;
  } catch (e) {
    console.error(e);
  }
}

export const getCandleChartData = async (coinId, days = 1) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`)
    return response.data;
  } catch (e) {
    console.log(e);
  }
}