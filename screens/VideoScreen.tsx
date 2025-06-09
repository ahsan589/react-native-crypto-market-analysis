import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import LottieView from 'lottie-react-native';

// Removed LinearGradient import

type VideoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoScreen'>;

interface VideoItem {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  progress: number;
  duration: string;
  views: string;
  date: string;
  description: string;
}

interface VideoScreenProps {
  navigation: VideoScreenNavigationProp;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VideoScreen: React.FC<VideoScreenProps> = ({ navigation }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const animationRefs = useRef<{ [key: string]: LottieView | null }>({}).current;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/ahsan589/crypto_video/main/videos.json');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
        setSelectedVideo(data[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchVideos();
  }, []);

  const updateProgress = (id: string, progress: number) => {
    setVideos(prevVideos =>
      prevVideos.map(video => {
        if (video.id === id) {
          if (progress >= 100 && animationRefs[id]) {
            animationRefs[id]?.play(30, 120);
          }
          return { ...video, progress: Math.min(100, Math.max(0, progress)) };
        }
        return video;
      })
    );
  };

  const injectedJavaScript = `
    (function() {
      var video = document.querySelector('video');
      if (video) {
        video.addEventListener('timeupdate', function() {
          var progress = (video.currentTime / video.duration) * 100;
          window.ReactNativeWebView.postMessage(JSON.stringify({ progress: progress }));
        });
      }
    })();
    true;
  `;

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity
      style={[styles.videoItem, item.id === selectedVideo?.id && styles.selectedItem]}
      onPress={() => setSelectedVideo(item)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.thumbnailOverlay} />
        <Text style={styles.durationBadge}>{item.duration}</Text>
        <View style={styles.progressAnimationContainer}>
        </View>
      </View>

      <View style={styles.videoDetails}>
        <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.videoMeta}>
          <Text style={styles.metaText} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{item.date}</Text>
        </View>
      </View>

      {item.id === selectedVideo?.id && (
        <View style={styles.selectedIndicator}>
          <Icon name="play-circle-filled" size={24} color="#03A9F4" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../assets/lottie/progress.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
      
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <LottieView
          source={require('../assets/lottie/error.json')}
          autoPlay
          loop
          style={styles.errorAnimation}
        />
        <Text style={styles.errorText}>Oops! {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <LottieView
              source={require('../assets/lottie/lon.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Crypto Academy</Text>
              <Text style={styles.headerSubtitle}>Master blockchain technology</Text>
            </View>
          </View>
        </View>

        {selectedVideo && (
          <View style={styles.videoPlayerContainer}>
            <WebView
              javaScriptEnabled={true}
              domStorageEnabled={true}
              source={{ uri: selectedVideo.videoUrl }}
              style={styles.webView}
              allowsFullscreenVideo={true}
              startInLoadingState={true}
              injectedJavaScript={injectedJavaScript}
              onMessage={(event) => {
                const { progress } = JSON.parse(event.nativeEvent.data);
                updateProgress(selectedVideo.id, progress);
              }}
              renderLoading={() => (
                <View style={styles.loadingPlayer}>
                  <ActivityIndicator size="large" color="#03A9F4" />
                </View>
              )}
            />
            <View style={styles.playerOverlay} />
          </View>
        )}

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recommended Videos</Text>
        </View>

        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderVideoItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  
  },
  backgroundGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  progressAnimationContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
  },
  progressAnimation: {
    width: 40,
    height: 40,
  },
  header: {
    backgroundColor: '#03A9F4',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 60,
    height: 60,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#f3e5f5',
  },
  videoPlayerContainer: {
    height: 195,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    borderRadius: 12,
  },
  playerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#03A9F4',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  selectedItem: {
    borderColor: '#03A9F4',
    borderWidth: 1.5,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 10,
  },
  thumbnail: {
    width: 100,
    height: 60,
    borderRadius: 8,
  },
  thumbnailOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 20,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    fontSize: 10,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 2,
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingAnimation: {
    width: 130,
    height: 130,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  errorAnimation: {
    width: 120,
    height: 120,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#03A9F4',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  loadingPlayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
});

export default VideoScreen;