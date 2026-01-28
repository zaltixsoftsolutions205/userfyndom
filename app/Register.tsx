import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, clearRegistrationSuccess } from "../app/reduxStore/reduxSlices/authSlice";
import { RootState } from "../app/reduxStore/store/store";

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    referredBy: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Handle registration response
  useEffect(() => {
    console.log('📊 Registration status:', {
      success: auth.registrationSuccess,
      loading: auth.loading,
      error: auth.error,
      data: auth.registrationData
    });

    if (auth.registrationSuccess && auth.registrationData) {
      const referralCode = auth.registrationData.referralCode;
      
      Alert.alert(
        "🎉 Registration Successful!",
        `Welcome to Fyndom!\n\nYour Referral Code: ${referralCode}\n\nShare this code with friends to earn ₹250 when they book.`,
        [
          {
            text: "Continue to Login",
            onPress: () => {
              resetForm();
              dispatch(clearRegistrationSuccess());
              router.push("/login");
            }
          }
        ]
      );
    }

    if (auth.error) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: auth.error
      });
      dispatch(clearError());
    }
  }, [auth.registrationSuccess, auth.error, auth.registrationData]);

  const resetForm = () => {
    setFormData({
      fullName: "",
      mobileNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      referredBy: ""
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    // Mobile validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Enter valid 10-digit Indian number";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    const registrationData = {
      fullName: formData.fullName.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      ...(formData.referredBy.trim() && { referredBy: formData.referredBy.trim().toUpperCase() })
    };

    console.log("📤 Registering with data:", { ...registrationData, password: "***", confirmPassword: "***" });

    try {
      await dispatch(register(registrationData)).unwrap();
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error || "Something went wrong. Please try again."
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim().length >= 3 &&
      /^[6-9]\d{9}$/.test(formData.mobileNumber) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword
    );
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
          <Text style={styles.title}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.welcomeText}>Join Fyndom Today!</Text>
          <Text style={styles.subtitle}>Create your account in seconds</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Enter your full name"
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
            autoCapitalize="words"
            editable={!auth.loading}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          {/* Mobile Number */}
          <Text style={styles.label}>Mobile Number *</Text>
          <View style={[styles.phoneInput, errors.mobileNumber && styles.inputError]}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.phoneInputField}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              value={formData.mobileNumber}
              onChangeText={(text) => handleInputChange('mobileNumber', text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              editable={!auth.loading}
            />
          </View>
          {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            editable={!auth.loading}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password *</Text>
          <View style={[styles.passwordInput, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordField}
              placeholder="Create a password (min 6 chars)"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
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

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password *</Text>
          <View style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}>
            <TextInput
              style={styles.passwordField}
              placeholder="Re-enter your password"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              editable={!auth.loading}
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={auth.loading}
            >
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* Referral Code */}
          <Text style={styles.label}>Referral Code (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter referral code if any"
            value={formData.referredBy}
            onChangeText={(text) => handleInputChange('referredBy', text.toUpperCase())}
            autoCapitalize="characters"
            editable={!auth.loading}
          />

          {/* Referral Benefit Info */}
          {formData.referredBy && (
            <View style={styles.referralInfo}>
              <Ionicons name="gift-outline" size={16} color="#219150" />
              <Text style={styles.referralInfoText}>
                Your friend gets ₹250 OFF on their first booking using this code!
              </Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, (!isFormValid() || auth.loading) && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid() || auth.loading}
          >
            {auth.loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            By registering, you agree to our Terms of Service & Privacy Policy
          </Text>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")} disabled={auth.loading}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 30,
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
    marginBottom: 30,
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
  phoneInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  phoneInputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
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
  referralInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f8e9",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  referralInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#219150",
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: "#219150",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#219150",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: "#a8d5ba",
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  termsText: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    marginBottom: 20,
  },
  loginText: {
    color: "#666",
    fontSize: 15,
  },
  loginLink: {
    color: "#219150",
    fontWeight: "bold",
    fontSize: 15,
  },
});