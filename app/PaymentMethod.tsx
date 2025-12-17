import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PaymentMethod() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    hostelName,
    fullName,
    mobile,
    email,
    aadhaarName,
    roomSharing,
    duration,
  } = params;

  const [paymentDone, setPaymentDone] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    { name: "Google Pay", icon: "logo-google" },
    { name: "PhonePe", icon: "phone-portrait-outline" },
    { name: "Paytm", icon: "wallet-outline" },
    { name: "UPI", icon: "qr-code-outline" },
  ];

  const handlePay500 = () => {
    if (!selectedMethod) {
      Toast.show({
        type: "error",
        text1: "Select a payment method first",
      });
      return;
    }
    setShowPaymentModal(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentDone(true);
      Toast.show({
        type: "success",
        text1: `₹500 Payment Successful ✅`,
        text2: `Paid via ${selectedMethod}`,
      });
    }, 2000);
  };

  const handleDone = () => {
    if (!paymentDone) {
      Toast.show({
        type: "error",
        text1: "Please complete payment first",
      });
      return;
    }
    router.push("/Bookings");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Booking Summary */}
        <View style={styles.card}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <Text style={styles.summaryText}>🏠 Hostel: {hostelName}</Text>
          <Text style={styles.summaryText}>👤 Name: {fullName}</Text>
          <Text style={styles.summaryText}>📞 Mobile: {mobile}</Text>
          <Text style={styles.summaryText}>📧 Email: {email}</Text>
          <Text style={styles.summaryText}>🆔 Aadhaar: {aadhaarName}</Text>
          <Text style={styles.summaryText}>🛏 Room: {roomSharing}</Text>
          <Text style={styles.summaryText}>📅 Duration: {duration}</Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.selectText}>Select Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.name}
            style={[
              styles.paymentOption,
              selectedMethod === method.name && styles.paymentOptionSelected,
            ]}
            onPress={() => {
              setSelectedMethod(method.name);
              setPaymentDone(false);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={method.icon as any}
              size={24}
              color={selectedMethod === method.name ? "#16a34a" : "#374151"}
              style={{ marginRight: 14 }}
            />
            <Text style={styles.paymentOptionText}>{method.name}</Text>
            {selectedMethod === method.name && (
              <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
            )}
          </TouchableOpacity>
        ))}

        {/* Pay Button */}
        <TouchableOpacity
          style={[
            styles.payBtn,
            (!selectedMethod || paymentDone) && styles.payBtnDisabled,
          ]}
          onPress={handlePay500}
          activeOpacity={selectedMethod ? 0.8 : 1}
          disabled={!selectedMethod || paymentDone}
        >
          <Text style={styles.payBtnText}>
            {paymentDone ? "₹500 Paid ✅" : "Pay ₹500"}
          </Text>
        </TouchableOpacity>

        {/* Done Button */}
        <TouchableOpacity
          style={[styles.doneBtn, !paymentDone && styles.doneBtnDisabled]}
          onPress={handleDone}
          activeOpacity={paymentDone ? 0.8 : 1}
          disabled={!paymentDone}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Payment Loading Modal */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.modalText}>Processing Payment...</Text>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f0fdf4", // light green
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#16a34a", // green
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 3,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#facc15", // yellow
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 8,
    color: "#374151",
  },
  selectText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#14532d",
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    elevation: 2,
  },
  paymentOptionSelected: {
    borderWidth: 2,
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7",
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 17,
    color: "#374151",
    fontWeight: "600",
  },
  payBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  payBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  payBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  doneBtn: {
    backgroundColor: "#facc15",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
  },
  doneBtnDisabled: {
    backgroundColor: "#d1d5db",
  },
  doneText: {
    color: "#14532d",
    fontWeight: "700",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#14532d",
    marginTop: 10,
  },
});
