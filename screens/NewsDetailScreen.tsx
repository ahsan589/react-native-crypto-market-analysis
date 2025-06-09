import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../app/app";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NewsItem } from "../types/index";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "@react-navigation/native";
type NewsDetailRouteProp = RouteProp<RootStackParamList, "NewsDetail">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const NewsDetailScreen = ({ route }: { route: NewsDetailRouteProp }) => {
  const { item }: { item: NewsItem } = route.params;
  const [expanded, setExpanded] = useState(false); // Toggle for full text
 const { colors } = useTheme();
  // Convert categories and tags from strings to arrays
  const categories = item.categories ? item.categories.split("|") : [];
  const tags = item.tags ? item.tags.split("|") : [];

  // Convert published_on (Unix timestamp) to a readable date
  const date = item.published_on
    ? new Date(item.published_on * 1000).toLocaleDateString()
    : "No date available";

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageurl }} style={styles.image} />
        <View style={styles.imageOverlay} />
        <Text style={styles.title} numberOfLines={2} >{item.title}</Text>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Source Information */}
        <View style={styles.sourceContainer}>
          <Image source={{ uri: item.source_info.img }} style={styles.sourceLogo} />
          <Text style={styles.sourceText}>{item.source_info.name}</Text>
        </View>

        {/* Expandable Article Body */}
        <Text style={styles.body} numberOfLines={expanded ? undefined : 2}>
          {item.body}
        </Text>

        {/* Read More / Read Less Button */}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.readMoreButton}
        >
          <Text style={styles.readMoreText}>
            {expanded ? "Read Less" : "Read More"}
          </Text>
        </TouchableOpacity>

        {/* Tags & Categories */}
        <View style={styles.metaContainer}>
          <Text style={styles.metaTitle}>Categories:</Text>
          <View style={styles.tagContainer}>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <Text key={index} style={styles.tag}>
                  {category}
                </Text>
              ))
            ) : (
              <Text style={styles.noDataText}>No categories available</Text>
            )}
          </View>

          <Text style={styles.metaTitle}>Tags:</Text>
          <View style={styles.tagContainer}>
            {tags.length > 0 ? (
              tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag}
                </Text>
              ))
            ) : (
              <Text style={styles.noDataText}>No tags available</Text>
            )}
          </View>
        </View>

        {/* Published Date */}
        <Text style={styles.date}>Published on: {date}</Text>

        {/* Read Full Article Button */}
          <TouchableOpacity
                style={[styles.websiteButton]}
                onPress={() => Linking.openURL(item.url)}
              >
                <Ionicons name="globe" size={20} color="white" />
                <Text style={styles.websiteButtonText}>Visit Website</Text>
              </TouchableOpacity>
      
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.6,
    position: "relative",
    marginBottom: 20,
    overflow: "hidden",
    borderBottomLeftRadius: 20, // Rounded bottom-left corner
    borderBottomRightRadius: 20, // Rounded bottom-right corner
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 10, // Match container's rounded corners
    borderBottomRightRadius: 10, // Match container's rounded corners
  },
  title: {
    position: "absolute",
    bottom: 20,
    left: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    padding: 6,
  },
  content: {
    paddingHorizontal: 20,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sourceLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  sourceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  body: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
    marginBottom: 20,
  },
  readMoreButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  readMoreText: {
    color: "#007BFF",
    fontSize: 16,
    fontWeight: "600",
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#03A9F4",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  websiteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  metaContainer: {
    marginBottom: 20,
  },
  metaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#eee",
    color: "#333",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  upvoteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginLeft: 5,
  },
  downvoteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F44336",
    marginLeft: 5,
  },
  date: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default NewsDetailScreen;