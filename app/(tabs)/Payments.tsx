// import { useRouter } from "expo-router";
// import React from "react";
// import {
//   FlatList,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useThemeContext } from "@/components/ui/ThemeContext";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const { width } = Dimensions.get("window");

// export default function Payments() {
//   const { isDark } = useThemeContext();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();

//   const theme = isDark
//     ? {
//         background: "#000000",
//         cardBackground: "#121212",
//         text: "#EEEEEE",
//         headerText: "#A5D6A7",
//         accent: "#FFD801",
//         shadow: "#000000",
//         border: "#333333",
//         paidBadgeBg: "#22c55e",
//         pendingBadgeBg: "#f59e0b",
//       }
//     : {
//         background: "#FFFFFF",
//         cardBackground: "#F5F5F5",
//         text: "#222222",
//         headerText: "#1E3A1E",
//         accent: "#FFD801",
//         shadow: "#CCCCCC",
//         border: "#E0E0E0",
//         paidBadgeBg: "#22c55e",
//         pendingBadgeBg: "#f59e0b",
//       };

//   const payments = [
//     {
//       id: "1",
//       hostel: "Green Valley Hostel",
//       amount: "₹8,500",
//       date: "2024-01-01",
//       method: "UPI",
//       status: "Paid",
//     },
//     {
//       id: "2",
//       hostel: "Comfort Inn PG",
//       amount: "₹6,500",
//       date: "2023-12-01",
//       method: "Bank Transfer",
//       status: "Pending",
//     },
//   ];

//   // ✅ Back handler (works properly)
//   const handleBack = () => {
//     try {
//       if (router.canGoBack()) {
//         router.back();
//       } else {
//         router.push("/"); // fallback to home if no navigation history
//       }
//     } catch (err) {
//       console.error("Back navigation error:", err);
//       router.push("/");
//     }
//   };

//   const renderPayment = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={[
//         styles.card,
//         {
//           backgroundColor: theme.cardBackground,
//           width: width - 32,
//           alignSelf: "center",
//           shadowColor: theme.shadow,
//           borderColor: theme.border,
//         },
//       ]}
//       activeOpacity={item.status === "Pending" ? 0.8 : 1}
//       onPress={() => {
//         if (item.status === "Pending") {
//           router.push({ pathname: "/PaymentMethod", params: item });
//         }
//       }}
//     >
//       <View style={styles.row}>
//         <Text style={[styles.hostel, { color: theme.headerText }]}>
//           {item.hostel}
//         </Text>
//         <View
//           style={[
//             styles.statusBadge,
//             {
//               backgroundColor:
//                 item.status === "Paid"
//                   ? theme.paidBadgeBg
//                   : theme.pendingBadgeBg,
//             },
//           ]}
//         >
//           <Text style={styles.statusText}>{item.status}</Text>
//         </View>
//       </View>

//       <Text style={[styles.detail, { color: theme.text }]}>
//         💰 Amount: {item.amount}
//       </Text>
//       <Text style={[styles.detail, { color: theme.text }]}>
//         📅 Date: {item.date}
//       </Text>
//       <Text style={[styles.detail, { color: theme.text }]}>
//         💳 Method: {item.method}
//       </Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
//       {/* ✅ Header with functional back button */}
//       <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={handleBack}
//           activeOpacity={0.7}
//         >
//           <Ionicons name="arrow-back" size={26} color={theme.headerText} />
//         </TouchableOpacity>

//         <Text
//           style={[
//             styles.heading,
//             {
//               color: theme.headerText,
//               position: "absolute",
//               left: 0,
//               right: 0,
//               textAlign: "center",
//               top: 50,
//               fontSize: 20,
//             },
//           ]}
//         >
//           📜 Payment History
//         </Text>
//       </View>

//       <FlatList
//         data={payments}
//         renderItem={renderPayment}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginBottom: 10,
//     height: 80,
//   },
//   backButton: {
//     paddingRight: 12,
//     zIndex: 10,
//   },
//   heading: {
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   card: {
//     borderRadius: 16,
//     paddingVertical: 18,
//     paddingHorizontal: 20,
//     marginBottom: 16,
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//     borderWidth: 1,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   hostel: {
//     fontSize: 18,
//     fontWeight: "700",
//     letterSpacing: 0.12,
//   },
//   statusBadge: {
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 12,
//     fontWeight: "600",
//   },
//   statusText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 13,
//   },
//   detail: {
//     fontSize: 15,
//     marginTop: 6,
//     fontWeight: "500",
//     letterSpacing: 0.14,
//   },
// });

import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "@/components/ui/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ApiClient from "@/app/api/ApiClient";

const { width } = Dimensions.get("window");

export default function Payments() {
  const { isDark } = useThemeContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ⭐ Fetch Payment History from backend
  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await ApiClient.get("/students/payments");

      if (response.success) {
        // Map backend data to frontend structure
        const formatted = response.data.map((item) => ({
          id: item._id,
          name: item.hostelName,
          status: item.status === "paid" ? "Confirmed" : "Pending",
          checkIn: item.checkInDate
            ? item.checkInDate.split("T")[0]
            : "N/A",
          duration: item.durationType
            ? `${item.duration} ${item.durationType}`
            : "N/A",
          amount: `₹${item.amount}`,
          sharing: item.sharingType || "N/A",
          roomNumber: item.roomNumber || "N/A",
        }));

        setPayments(formatted);
      }
    } catch (err) {
      console.log("PAYMENT FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/");
  };

  const renderPayment = ({ item }) => (
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
          💰 Amount: {item.amount}
        </Text>
        <Text style={[styles.detail, { color: theme.text }]}>
          📅 Check-in: {item.checkIn}
        </Text>
        {/* <Text style={[styles.detail, { color: theme.text }]}>
          ⏳ Duration: {item.duration}
        </Text> */}
        <Text style={[styles.detail, { color: theme.text }]}>
          🛏️ Sharing: {item.sharing}
        </Text>
        {/* <Text style={[styles.detail, { color: theme.text }]}>
          🔢 Room No: {item.roomNumber}
        </Text> */}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
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
          📖 Payment History
        </Text>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPayment}
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
  backButton: { paddingRight: 12, zIndex: 10 },
  heading: { fontWeight: "700", letterSpacing: 0.5 },

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
  detailsBox: { marginTop: 6 },
  detail: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: "500",
    letterSpacing: 0.14,
  },
});
