import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Notification = {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  isNew: boolean;
};

const notifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Booking Confirmed",
    description: "Your booking at Green Valley Hostel has been confirmed.",
    time: "2 hours ago",
    isNew: true,
  },
  {
    id: "2",
    type: "warning",
    title: "Payment Reminder",
    description: "Your monthly payment is due in 3 days.",
    time: "1 day ago",
    isNew: true,
  },
  {
    id: "3",
    type: "info",
    title: "New Hostel Available",
    description: "A new hostel matching your preferences is now available.",
    time: "3 days ago",
    isNew: false,
  },
];

export default function Notifications() {
  const router = useRouter();

  const theme = {
    background: "#FFFFFF",
    cardBackground: "#F5F5F5",
    text: "#104E15",
    header: "#228B22",
    accentSuccess: "#22c55e",
    accentWarning: "#FFD801",
    accentInfo: "#6B8E23",
    newBadgeBg: "#FFD801",
    shadow: "#CCCCCC",
    border: "#E0E0E0",
    backButtonColor: "#104E15",
  };

  const renderIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <Ionicons name="checkmark-circle" size={24} color={theme.accentSuccess} />;
      case "warning":
        return <Ionicons name="alert-circle" size={24} color={theme.accentWarning} />;
      case "info":
        return <Ionicons name="information-circle" size={24} color={theme.accentInfo} />;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { paddingTop: 36, paddingBottom: 8 }]}>
  <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
    <Ionicons name="arrow-back" size={24} color={theme.backButtonColor} />
  </TouchableOpacity>

  {/* Heading moved down */}
  <View style={[styles.headerCenter, { top: 40 }]}>
    <Text style={[styles.header, { color: theme.header }]}>Notifications</Text>
  </View>
</View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.container, { paddingTop: 14, paddingBottom: 40 }]}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, shadowColor: theme.shadow }, item.isNew && styles.newCard]}>
            <View style={styles.icon}>{renderIcon(item.type)}</View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                {item.isNew && <Text style={[styles.newBadge, { backgroundColor: theme.newBadgeBg }]}>New</Text>}
              </View>
              <Text style={[styles.description, { color: theme.text }]}>{item.description}</Text>
              <Text style={[styles.time, { color: theme.text }]}>{item.time}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    position: "relative",
  },
  backBtn: {
    paddingRight: 12,
    zIndex: 2,
  },
  headerCenter: {
  position: "absolute",
  left: 0,
  right: 0,
  alignItems: "center",
},
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  container: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    width: width - 40,
    alignSelf: "center",
  },
  newCard: {
    backgroundColor: "#fef9c3",
  },
  icon: {
    marginRight: 12,
    alignSelf: "center",
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  newBadge: {
    color: "#104E15",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    overflow: "hidden",
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
});
