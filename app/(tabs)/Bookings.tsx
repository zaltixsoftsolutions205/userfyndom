import { useRouter } from "expo-router";
// import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "@/components/ui/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import BookingService from "@/app/api/BookingService";

const { width } = Dimensions.get("window");

export default function Bookings() {
  const { isDark } = useThemeContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = isDark
    ? {
      background: "#000000",
      cardBackground: "#121212",
      text: "#EEEEEE",
      headerText: "#A5D6A7",
      accent: "#FFD801",
      shadow: "#000000",
      border: "#333333",
      pendingBadgeBg: "#f59e0b",
      confirmedBadgeBg: "#22c55e",
    }
    : {
      background: "#FFFFFF",
      cardBackground: "#F5F5F5",
      text: "#222222",
      headerText: "#1E3A1E",
      accent: "#FFD801",
      shadow: "#CCCCCC",
      border: "#E0E0E0",
      pendingBadgeBg: "#f59e0b",
      confirmedBadgeBg: "#22c55e",
    };

  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingService.getBookingHistory();

      // Map backend fields to UI fields
      const formatted = response.data.map((b) => ({
        id: b._id,

        name: b.hostel?.hostelName ?? "Unknown Hostel",

        checkIn: b.bookingDetails?.checkInDate
          ? b.bookingDetails.checkInDate.split("T")[0]
          : "--",

        duration: `${b.bookingDetails?.duration ?? 0} ${b.bookingDetails?.durationType ?? ""}`,

        amount: `₹${b.bookingDetails?.amountPaid ?? 0}`,

        sharing: b.room?.sharingType ?? "--",

        roomNumber: b.room?.roomNumber ?? "--",

        status:
          b.status?.bookingStatus === "confirmed"
            ? "Confirmed"
            : "Pending",
      }));


      setBookingsData(formatted);
    } catch (error) {
      console.log("Booking fetch error:", error);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Back handler (works properly)
  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/"); // fallback to home if no navigation history
      }
    } catch (err) {
      console.error("Back navigation error:", err);
      router.push("/");
    }
  };

  const renderBooking = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          width: width - 32,
          alignSelf: "center",
          shadowColor: theme.shadow,
          borderColor: theme.border,
        },
      ]}
      activeOpacity={0.8}
      onPress={() => {
        // Navigate to booking details if needed
        // router.push({ pathname: "/BookingDetails", params: item });
      }}
    >
      <View style={styles.row}>
        <Text style={[styles.hostelName, { color: theme.headerText }]}>
          {item.name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "Confirmed"
                  ? theme.confirmedBadgeBg
                  : theme.pendingBadgeBg,
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailsBox}>
        <Text style={[styles.detail, { color: theme.text }]}>
          📅 Check-in: {item.checkIn}
        </Text>

        <Text style={[styles.detail, { color: theme.text }]}>
          ⏳ Duration: {item.duration}
        </Text>

        <Text style={[styles.detail, { color: theme.text }]}>
          💰 Amount: {item.amount}
        </Text>

        <Text style={[styles.detail, { color: theme.text }]}>
          🛏️ Sharing: {item.sharing}
        </Text>

        <Text style={[styles.detail, { color: theme.text }]}>
          🔢 Room No: {item.roomNumber}
        </Text>
      </View>

    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* ✅ Header with functional back button */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color={theme.headerText} />
        </TouchableOpacity>

        <Text
          style={[
            styles.heading,
            {
              color: theme.headerText,
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
              top: 50,
              fontSize: 20,
            },
          ]}
        >
          📖 My Bookings
        </Text>
      </View>

      <FlatList
        data={bookingsData}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    height: 80,
  },
  backButton: {
    paddingRight: 12,
    zIndex: 10,
  },
  heading: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hostelName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.12,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "600",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  detailsBox: {
    marginTop: 6,
  },
  detail: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: "500",
    letterSpacing: 0.14,
  },
});