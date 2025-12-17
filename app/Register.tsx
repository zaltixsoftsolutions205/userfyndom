import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import ApiClient from "../app/api/ApiClient";

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState(""); // <-- Referral code state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !mobile || !email || !password || !confirmPassword) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    try {
      // Prepare the payload expected by backend
      const payload: Record<string, any> = {
        fullName,
        mobileNumber: mobile,
        email,
        password,
        confirmPassword: password,
      };

      if (referralCode.trim()) {
        payload.referralCode = referralCode.trim();
      }

      console.log("pay load from register", payload);

      // Call API using ApiClient
      const response = await ApiClient.post("/students/register", payload);

      console.log("Register Response:", response);

      Toast.show({ type: "success", text1: "Registered Successfully 🎉" });

      // Redirect to Login page after 1.5s
      setTimeout(() => router.push("/login"), 1500);

      // Optional: clear form fields
      setFullName("");
      setMobile("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setReferralCode("");
    } catch (error: any) {
      console.log(error);

      console.error("Register Error:", error);

      // Handle error gracefully
      const errMsg =
        error?.response?.data?.message || "Registration failed. Try again.";
      Toast.show({ type: "error", text1: errMsg });
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.topSection}>
        <Text style={styles.heading}>Let's Get Started!</Text>
        <Text style={styles.subheading}>
          Enter your details to create an account.
        </Text>
      </View>

      <View style={styles.inputCard}>
        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, marginBottom: 0, borderWidth: 0 },
              ]}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#475569"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, marginBottom: 0, borderWidth: 0 },
              ]}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#475569"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Referral Code (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter referral code"
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  fullName &&
                  mobile &&
                  email &&
                  password &&
                  confirmPassword
                    ? "#4a7c59"
                    : "#cfcfaf",
              },
            ]}
            disabled={
              !fullName ||
              !mobile ||
              !email ||
              !password ||
              !confirmPassword
            }
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.loginRedirect}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}> Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#529967ff" },
  topSection: {
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
    backgroundColor: "#529967ff",
  },
  heading: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 32,
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: { color: "#fff", fontSize: 16, textAlign: "center" },
  inputCard: {
    flex: 1,
    backgroundColor: "#fff7a4ff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 22,
    shadowColor: "#333",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    color: "#2e2e2e",
    fontWeight: "bold",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2d8c1",
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2d8c1",
    marginBottom: 10,
    paddingRight: 4,
  },
  eyeIcon: { paddingHorizontal: 8 },
  button: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
  },
  loginRedirect: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  loginText: { color: "#2e2e2e", fontSize: 14 },
  loginLink: { color: "#28a745", fontWeight: "bold", fontSize: 14 },
});