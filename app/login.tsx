import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../app/reduxStore/reduxSlices/authSlice";
import { RootState } from "../app/reduxStore/store/store";
import { useRouter } from "expo-router";
import PasswordResetService from "../app/api/PasswordResetService";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0-email, 1-otp, 2-new, 3-success
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotOtp, setShowForgotOtp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const backAction = () => {
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (auth.token) {
      Toast.show({ type: "success", text1: "Login Successful 🎉" });
      setTimeout(() => router.replace("/(tabs)/Home"), 1500);
    }
    if (auth.error) {
      Toast.show({ type: "error", text1: auth.error });
    }
  }, [auth.token, auth.error]);

  // --- Login form validation
  const validateForm = () => {
    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Email required" });
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Toast.show({ type: "error", text1: "Invalid email format" });
      return false;
    }
    if (!password.trim()) {
      Toast.show({ type: "error", text1: "Password required" });
      return false;
    }
    return true;
  };

  const handleSignIn = () => {
    if (!validateForm()) return;
    dispatch(login({ email, password }));
  };

  // --- Forgot password validation and handlers
  const validateForgotEmail = () => {
    let newErrors: { [key: string]: string } = {};
    const emailRegex = /\S+@\S+\.\S+/;
    if (!forgotEmail.trim()) newErrors.forgotEmail = "Email required";
    else if (!emailRegex.test(forgotEmail)) newErrors.forgotEmail = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotOtp = () => {
    let newErrors: { [key: string]: string } = {};
    if (!forgotOtp.trim()) newErrors.forgotOtp = "OTP required";
    else if (!/^\d{4,6}$/.test(forgotOtp)) newErrors.forgotOtp = "Invalid OTP";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgotNewPassword = () => {
    let newErrors: { [key: string]: string } = {};
    if (!forgotNewPassword) newErrors.forgotNewPassword = "New password required";
    else if (forgotNewPassword.length < 6) newErrors.forgotNewPassword = "Password must be at least 6 characters";
    if (!forgotConfirmPassword) newErrors.forgotConfirmPassword = "Confirm password required";
    else if (forgotNewPassword !== forgotConfirmPassword) newErrors.forgotConfirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 0: Request OTP
  const handleSendForgotOtp = async () => {
    if (!validateForgotEmail()) return;

    try {
      const res = await PasswordResetService.forgotPassword(forgotEmail);

      if (res.success) {
        Toast.show({ type: "success", text1: res.message });
        setForgotStep(1);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to send OTP",
      });
    }
  };

  // Step 1: Validate OTP
  const handleVerifyForgotOtp = async () => {
    if (!validateForgotOtp()) return;

    try {
      const res = await PasswordResetService.verifyOtp(
        forgotEmail,
        forgotOtp
      );

      if (res.success && res.data.otpValid) {
        Toast.show({ type: "success", text1: res.message });
        setForgotStep(2);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Invalid OTP",
      });
    }
  };


  // Step 2: New password
  const handleSetForgotPassword = async () => {
    if (!validateForgotNewPassword()) return;

    try {
      const res = await PasswordResetService.resetPassword(
        forgotEmail,
        forgotOtp,
        forgotNewPassword
      );

      if (res.success) {
        Toast.show({ type: "success", text1: res.message });
        setForgotStep(3);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Password reset failed",
      });
    }
  };


  const resetForgotFlow = () => {
    setForgotMode(false);
    setForgotStep(0);
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setErrors({});
  };

  return (
    <View style={styles.root}>
      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>
          {forgotMode ? "Forgot Password" : "Welcome Back!"}
        </Text>
        <Text style={styles.subheading}>
          {forgotMode ? "Reset your password" : "Sign in to continue"}
        </Text>
      </View>

      <View style={styles.inputCard}>
        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
          {/* ---- STANDARD LOGIN ---- */}
          {!forgotMode && (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                  placeholder="Enter your password"
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

              <TouchableOpacity
                style={[styles.button, {
                  backgroundColor: email && password ? "#4a7c59" : "#cfcfaf",
                }]}
                disabled={!email || !password}
                onPress={handleSignIn}
              >
                <Text style={styles.buttonText}>
                  {auth.loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setForgotMode(true)}
                style={{ marginTop: 10, alignSelf: "flex-end" }}
              >
                <Text style={{ color: "#22532b", fontWeight: "bold", fontSize: 14 }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Don’t have an account?</Text>
                <TouchableOpacity onPress={() => router.replace("/Register")}>
                  <Text style={styles.switchLink}> Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* --- FORGOT PASSWORD MULTISTEP --- */}
          {forgotMode && (
            <>
              {forgotStep === 0 && (
                <>
                  <Text style={styles.label}>Registered Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    autoCapitalize="none"
                  />
                  {!!errors.forgotEmail && (
                    <Text style={styles.errorText}>{errors.forgotEmail}</Text>
                  )}
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#228c43", marginTop: 12 }]}
                    onPress={handleSendForgotOtp}
                  >
                    <Text style={styles.buttonText}>Send OTP</Text>
                  </TouchableOpacity>
                </>
              )}

              {forgotStep === 1 && (
                <>
                  <Text style={styles.label}>Enter OTP</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                      placeholder="Enter OTP"
                      secureTextEntry={!showForgotOtp}
                      value={forgotOtp}
                      onChangeText={setForgotOtp}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowForgotOtp(!showForgotOtp)}
                    >
                      <Ionicons
                        name={showForgotOtp ? "eye-off" : "eye"}
                        size={20}
                        color="#475569"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!errors.forgotOtp && (
                    <Text style={styles.errorText}>{errors.forgotOtp}</Text>
                  )}
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#228c43", marginTop: 12 }]}
                    onPress={handleVerifyForgotOtp}
                  >
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  </TouchableOpacity>
                </>
              )}

              {forgotStep === 2 && (
                <>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                      placeholder="Enter new password"
                      secureTextEntry={!showForgotPassword}
                      value={forgotNewPassword}
                      onChangeText={setForgotNewPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowForgotPassword(!showForgotPassword)}
                    >
                      <Ionicons
                        name={showForgotPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#475569"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!errors.forgotNewPassword && (
                    <Text style={styles.errorText}>{errors.forgotNewPassword}</Text>
                  )}

                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                      placeholder="Re-enter new password"
                      secureTextEntry={!showForgotConfirmPassword}
                      value={forgotConfirmPassword}
                      onChangeText={setForgotConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() =>
                        setShowForgotConfirmPassword(!showForgotConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={showForgotConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#475569"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!errors.forgotConfirmPassword && (
                    <Text style={styles.errorText}>{errors.forgotConfirmPassword}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#228c43", marginTop: 12 }]}
                    onPress={handleSetForgotPassword}
                  >
                    <Text style={styles.buttonText}>Set New Password</Text>
                  </TouchableOpacity>
                </>
              )}

              {forgotStep === 3 && (
                <>
                  <Text style={styles.successMsg}>
                    🎉 Password updated. You can now login.
                  </Text>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "#4a7c59", marginTop: 20 }]}
                    onPress={resetForgotFlow}
                  >
                    <Text style={styles.buttonText}>Login Now</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={resetForgotFlow}
                style={{ marginTop: 16, alignSelf: "center" }}
              >
                <Text style={{ fontSize: 14, color: "#474a52" }}>
                  ⬅ Back to Login
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#48a063ff",
  },
  topSection: {
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: "center",
    backgroundColor: "#48a063ff",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
    zIndex: 10,
  },
  heading: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 32,
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  inputCard: {
    flex: 1,
    backgroundColor: "#fffbd3ff",
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
  switchContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "center",
  },
  switchText: {
    fontSize: 14,
    color: "#475569",
  },
  switchLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#28a745",
  },
  errorText: { color: "#ef4444", fontSize: 12, marginBottom: 1 },
  successMsg: {
    color: "#228c43",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
});