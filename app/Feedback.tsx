// app/Feedback.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Sample feedback data
const feedbacks = [
  {
    id: "1",
    hostelName: "Sunrise Hostel",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    rating: 4,
    description: "Very clean and comfortable stay. Staff were friendly!",
  },
  {
    id: "2",
    hostelName: "GreenView Hostel",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    rating: 5,
    description: "Amazing experience, great location, and affordable price.",
  },
  {
    id: "3",
    hostelName: "BlueSky Hostel",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800",
    rating: 3,
    description: "Decent hostel, but could improve on facilities.",
  },
];

export default function Feedback() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#ff7b54" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>My Feedbacks</Text>
        </View>
      </View>

      {/* Feedback List */}
      <ScrollView contentContainerStyle={styles.container}>
        {feedbacks.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* Hostel Image */}
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              {/* Hostel Name */}
              <Text style={styles.hostelName}>{item.hostelName}</Text>

              {/* Rating */}
              <View style={styles.ratingRow}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Ionicons
                    key={index}
                    name={index < item.rating ? "star" : "star-outline"}
                    size={20}
                    color="#facc15"
                  />
                ))}
              </View>

              {/* Description */}
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  backText: {
    marginLeft: 4,
    fontSize: 15,
    color: "#ff7b54",
    fontWeight: "500",
  },
  titleWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  headerTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: "600",
    color: "#f97316",
  },
  container: {
    padding: isTablet ? 20 : 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: isTablet ? 220 : 180,
  },
  cardContent: {
    padding: isTablet ? 16 : 12,
  },
  hostelName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1f2937",
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  description: {
    fontSize: isTablet ? 14 : 13,
    color: "#374151",
    lineHeight: 20,
  },
});
