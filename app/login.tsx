import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../app/reduxStore/reduxSlices/authSlice";
import { RootState } from "../app/reduxStore/store/store";
import { useRouter } from "expo-router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('📊 Login status:', {
      isAuthenticated: auth.isAuthenticated,
      loading: auth.loading,
      error: auth.error
    });

    if (auth.isAuthenticated) {
      Toast.show({ 
        type: "success", 
        text1: "Login Successful!",
        text2: "Welcome back to Fyndom"
      });
      setTimeout(() => router.replace("/(tabs)/Home"), 1000);
    }

    if (auth.error) {
      Toast.show({ 
        type: "error", 
        text1: "Login Failed", 
        text2: auth.error 
      });
      dispatch(clearError());
    }
  }, [auth.isAuthenticated, auth.error]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) return;

    const loginData = {
      email: email.trim().toLowerCase(),
      password: password
    };

    console.log("📤 Logging in with:", { ...loginData, password: "***" });
    dispatch(login(loginData));
  };

  const isFormValid = () => {
    return email.trim() && password;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome Back</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Sign in to Fyndom</Text>
          <Text style={styles.subtitle}>Enter your credentials to continue</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            editable={!auth.loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.passwordInput, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordField}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
              editable={!auth.loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              disabled={auth.loading}
            >
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => router.push("/ForgotPassword")}
            disabled={auth.loading}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, (!isFormValid() || auth.loading) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!isFormValid() || auth.loading}
          >
            {auth.loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity 
              onPress={() => router.push("/Register")}
              disabled={auth.loading}
            >
              <Text style={styles.registerLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login (Optional) */}
          <TouchableOpacity style={styles.googleButton} disabled={auth.loading}>
            <Ionicons name="logo-google" size={20} color="#666" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#219150",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: "100%",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#219150",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff4444",
    backgroundColor: "#fff8f8",
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  passwordField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 10,
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "#219150",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#219150",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#219150",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#a8d5ba",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  registerText: {
    color: "#666",
    fontSize: 15,
  },
  registerLink: {
    color: "#219150",
    fontWeight: "bold",
    fontSize: 15,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    paddingHorizontal: 10,
    color: "#999",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingVertical: 14,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});