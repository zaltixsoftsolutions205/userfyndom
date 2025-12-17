import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Contact() {
  const router = useRouter();
  const email = "support@fyndom.com";
  const phone = "+91 9876543210";

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = () => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#ff7b54" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Title Section */}
      <Text style={styles.title}>📞 Contact Us</Text>
      <Text style={styles.subtitle}>We're here to help you!</Text>

      {/* Contact Cards */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={22} color="#ff7b54" />
          <Text style={styles.label}>Email</Text>
        </View>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={styles.link}>{email}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={22} color="#ff7b54" />
          <Text style={styles.label}>Phone</Text>
        </View>
        <TouchableOpacity onPress={handlePhonePress}>
          <Text style={styles.link}>{phone}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    color: "#ff7b54",
    fontWeight: "600",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    color: "#ff7b54",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },

  card: {
    width: width - 40,
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  link: {
    fontSize: 15,
    color: "#ff7b54",
    textDecorationLine: "underline",
    marginLeft: 32,
  },
});
