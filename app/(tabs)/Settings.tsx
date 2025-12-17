import { useThemeContext } from "@/components/ui/ThemeContext";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StudentService from "@/app/api/StudentService";
import { logout } from "../../app/reduxStore/reduxSlices/authSlice";
import { useDispatch } from "react-redux";

const { width } = Dimensions.get("window");

export default function SettingsPage() {
  const { isDark, toggleTheme } = useThemeContext();
  const [notifications, setNotifications] = useState(true);
  const [activeSection, setActiveSection] = useState<null | string>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ⭐ Profile State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // ⭐ Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🎯 AUTO-FILL PROFILE ON LOAD
  const loadProfile = async () => {
    try {
      const res = await StudentService.getProfile();
      if (res.success) {
        setFullName(res.data.fullName || "");
        setEmail(res.data.email || "");
      }
    } catch (err) {
      console.log("PROFILE LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 🎯 Save Profile API
  const handleSaveProfile = async () => {
    if (!fullName || !email) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }
    try {
      const res = await StudentService.updateProfile({ fullName, email });
      if (res.success) {
        Toast.show({ type: "success", text1: "Profile Updated" });
        setActiveSection(null);
        loadProfile();
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Update failed",
      });
    }
  };

  // 🎯 Change Password API
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }

    try {
      const res = await StudentService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        Toast.show({ type: "success", text1: "Password Updated" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setActiveSection(null);
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.response?.data?.message || "Unable to update password",
      });
    }
  };

  const theme = isDark
    ? {
      background: "#000000",
      cardBackground: "#121212",
      text: "#EEEEEE",
      headerText: "#A5D6A7",
      accent: "#FFD801",
      shadow: "#000000",
      border: "#333333",
      saveBtn: "#22c55e",
      cancelBtn: "#6b7280",
      switchTrack: { true: "#22c55e", false: "#6b7280" },
    }
    : {
      background: "#FFFFFF",
      cardBackground: "#F5F5F5",
      text: "#222222",
      headerText: "#1E3A1E",
      accent: "#FFD801",
      shadow: "#CCCCCC",
      border: "#E0E0E0",
      saveBtn: "#22c55e",
      cancelBtn: "#6b7280",
      switchTrack: { true: "#22c55e", false: "#d1d5db" },
    };

  // Back handler
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/");
  };

  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
    Toast.show({
      type: "success",
      text1: "Logged Out",
    });
    setTimeout(() => router.replace("/"), 1200);
  };

  // ⭐ MAIN SECTION RENDERER (UI unchanged)
  const renderSection = () => {
    switch (activeSection) {
      case "editProfile":
        return (
          <View style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Edit Profile</Text>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Full Name"
              placeholderTextColor={isDark ? "#aaa" : "#888"}
              value={fullName}
              onChangeText={setFullName}
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor={isDark ? "#aaa" : "#888"}
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.saveBtn }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.cancelBtn }]}
                onPress={() => setActiveSection(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "changePassword":
        return (
          <View style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Password</Text>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Current Password"
              secureTextEntry
              placeholderTextColor={isDark ? "#aaa" : "#888"}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="New Password"
              secureTextEntry
              placeholderTextColor={isDark ? "#aaa" : "#888"}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Confirm Password"
              secureTextEntry
              placeholderTextColor={isDark ? "#aaa" : "#888"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.saveBtn }]}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.cancelBtn }]}
                onPress={() => setActiveSection(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "aboutApp":
        return (
          <View style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About App</Text>
            <Text style={[styles.aboutText, { color: theme.text }]}>
              This is a sample settings app made in React Native.
            </Text>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.cancelBtn, marginTop: 10 }]}
              onPress={() => setActiveSection(null)}
            >
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
          </View>
        );

      case "privacyPolicy":
        return (
          <View style={[styles.sectionContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy Policy</Text>
            <Text style={[styles.aboutText, { color: theme.text }]}>
              Your privacy is important. No data is shared.
            </Text>

            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: theme.cancelBtn, marginTop: 10 }]}
              onPress={() => setActiveSection(null)}
            >
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
          ⚙️ Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 10 }}>
        {activeSection === null ? (
          <>
            {/* ⭐ Profile Card with autofill */}
            <View
              style={[
                styles.profileCard,
                { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border },
              ]}
            >
              <Icon name="account-circle" size={65} color={theme.headerText} />
              <View style={{ marginLeft: 14 }}>
                <Text style={[styles.profileName, { color: theme.text }]}>{fullName}</Text>
                <Text style={[styles.profileEmail, { color: theme.text }]}>{email}</Text>
              </View>
            </View>

            {/* General Section */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>General</Text>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border }]}
              onPress={() => setActiveSection("editProfile")}
            >
              <Icon name="account-edit" size={22} color={theme.headerText} />
              <Text style={[styles.optionText, { color: theme.text }]}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border }]}
              onPress={() => setActiveSection("changePassword")}
            >
              <Icon name="lock-reset" size={22} color={theme.headerText} />
              <Text style={[styles.optionText, { color: theme.text }]}>Change Password</Text>
            </TouchableOpacity>

            {/* Preferences */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>Preferences</Text>

            <View
              style={[
                styles.optionRow,
                { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border },
              ]}
            >
              <Icon name="bell-ring" size={22} color={theme.headerText} />
              <Text style={[styles.optionText, { color: theme.text }]}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={theme.switchTrack}
                thumbColor="#fff"
                style={{ marginLeft: "auto" }}
              />
            </View>

            <View
              style={[
                styles.optionRow,
                { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border },
              ]}
            >
              <Icon name="theme-light-dark" size={22} color={theme.headerText} />
              <Text style={[styles.optionText, { color: theme.text }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={theme.switchTrack}
                thumbColor="#fff"
                style={{ marginLeft: "auto" }}
              />
            </View>

            {/* About Section */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20, marginBottom: 12 }]}>About</Text>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border }]}
              onPress={() => setActiveSection("aboutApp")}
            >
              <Icon name="information" size={22} color={theme.headerText} />
              <Text style={[styles.optionText, { color: theme.text }]}>About App</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: theme.cardBackground, shadowColor: theme.shadow, borderColor: theme.border }]}
              onPress={() => setActiveSection("privacyPolicy")}
            >
              <Icon name="shield-check" size={22} color={theme.headerText} />
              <Text style={[styles.optionText, { color: theme.text }]}>Privacy Policy</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: theme.accent }]}
              onPress={handleLogout}
            >
              <Icon name="logout" size={22} color="#000" />
              <Text style={[styles.logoutText, { color: "#000" }]}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          renderSection()
        )}
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 10, height: 80 },
  backButton: { paddingRight: 12, zIndex: 10 },
  heading: { fontWeight: "700", letterSpacing: 0.5 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
  },

  profileName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  profileEmail: { fontSize: 14, opacity: 0.8 },

  sectionTitle: { fontSize: 16, fontWeight: "600" },

  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
  },

  optionText: { marginLeft: 12, fontSize: 15, fontWeight: "500" },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginTop: 30,
    justifyContent: "center",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  logoutText: { fontSize: 16, marginLeft: 8, fontWeight: "600" },

  sectionContent: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
  },

  input: { padding: 14, borderRadius: 12, marginBottom: 16, borderWidth: 1, fontSize: 15 },

  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },

  saveBtn: { padding: 14, borderRadius: 12, alignItems: "center", flex: 1 },
  cancelBtn: { padding: 14, borderRadius: 12, alignItems: "center", flex: 1 },

  saveText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  aboutText: { fontSize: 15, lineHeight: 22, marginBottom: 10 },
});
