// import React, { useState } from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Image,
//   Alert,
//   Dimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";

// export default function Profile() {
//   const router = useRouter();
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [profileName, setProfileName] = useState("John Doe");
//   const [profileMobile, setProfileMobile] = useState("9876543210");
//   const [profileEmail, setProfileEmail] = useState("johndoe@email.com");
//   const [hostelName, setHostelName] = useState("");
//   const insets = useSafeAreaInsets();

//   const screenWidth = Dimensions.get("window").width;
//   const imageSize = screenWidth * 0.35;
//   const iconSize = imageSize * 0.25;

//   const pickImageAsync = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission required", "Permission to access gallery is required!");
//       return;
//     }
//     let result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.7,
//     });
//     if (!result.canceled) {
//       setProfileImage(result.assets[0].uri);
//     }
//   };

//   const takePhotoAsync = async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission required", "Permission to access camera is required!");
//       return;
//     }
//     let result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.7,
//     });
//     if (!result.canceled) {
//       setProfileImage(result.assets[0].uri);
//     }
//   };

//   const showImagePickerOptions = () => {
//     Alert.alert(
//       "Update Profile Picture",
//       "Choose an option",
//       [
//         { text: "Capture Photo", onPress: takePhotoAsync },
//         { text: "Select from Gallery", onPress: pickImageAsync },
//         { text: "Cancel", style: "cancel" },
//       ],
//       { cancelable: true }
//     );
//   };

//   const saveChanges = () => {
//     Alert.alert("Success", "Your profile changes have been saved!");
//   };

//   const showHelp = () => {
//     Alert.alert(
//       "📞 Help & Support",
//       "For assistance, you can reach us at:\n\n📧 Email: support@fyndom.com\n📱 Mobile: +91 76748 43434",
//       [{ text: "OK", style: "default" }]
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.page, { paddingTop: insets.top || 20, backgroundColor: "#FFFFFF" }]}>
//       <ScrollView
//         contentContainerStyle={styles.container}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header */}
//         <View style={styles.headerRow}>
//           <TouchableOpacity onPress={() => router.back()}>
//             <Ionicons name="arrow-back" size={26} color="#228B22" />
//           </TouchableOpacity>
//           <Text style={[styles.headerTitle, { color: "#228B22" }]}>👤 My Profile</Text>
//           <View style={{ width: 26 }} />
//         </View>

//         {/* Profile Image */}
//         <TouchableOpacity
//           style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
//           onPress={showImagePickerOptions}
//           activeOpacity={0.7}
//         >
//           {profileImage ? (
//             <Image
//               source={{ uri: profileImage }}
//               style={[
//                 styles.profileImage,
//                 { width: imageSize, height: imageSize, borderRadius: imageSize / 2 },
//               ]}
//             />
//           ) : (
//             <View
//               style={[
//                 styles.placeholder,
//                 { width: imageSize, height: imageSize, borderRadius: imageSize / 2 },
//               ]}
//             >
//               <Ionicons name="person" size={imageSize * 0.55} color="#bbd365" />
//               <Text style={[styles.addPhotoText, { color: "#a3c85a" }]}>Add Photo</Text>
//             </View>
//           )}

//           {/* Edit Icon */}
//           <TouchableOpacity
//             style={[
//               styles.editIconContainer,
//               { width: iconSize, height: iconSize, borderRadius: iconSize / 2, backgroundColor: "#a3c85a" },
//             ]}
//             onPress={showImagePickerOptions}
//           >
//             <Ionicons name="camera" size={iconSize * 0.6} color="#fff" />
//           </TouchableOpacity>
//         </TouchableOpacity>

//         <Text style={[styles.name, { color: "#228B22" }]}>{profileName}</Text>

//         {/* Input Card */}
//         <View style={[styles.card, { backgroundColor: "#f9f9f9", borderColor: "#a3c85a" }]}>
//           <View style={styles.inputGroup}>
//             <Ionicons name="call-outline" size={20} color="#a3c85a" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={profileMobile}
//               onChangeText={setProfileMobile}
//               keyboardType="phone-pad"
//               maxLength={15}
//               placeholder="Mobile Number"
//               placeholderTextColor="#8daa63"
//             />
//           </View>

//           <View style={styles.inputGroup}>
//             <Ionicons name="mail-outline" size={20} color="#a3c85a" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={profileEmail}
//               onChangeText={setProfileEmail}
//               keyboardType="email-address"
//               placeholder="Email"
//               placeholderTextColor="#8daa63"
//               autoCapitalize="none"
//             />
//           </View>

//           <View style={styles.inputGroup}>
//             <Ionicons name="home-outline" size={20} color="#a3c85a" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               value={hostelName}
//               onChangeText={setHostelName}
//               placeholder="Hostel Name"
//               placeholderTextColor="#8daa63"
//             />
//           </View>
//         </View>

//         {/* Save Button */}
//         <TouchableOpacity
//           style={[
//             styles.saveButton,
//             { opacity: profileMobile && profileEmail ? 1 : 0.6, backgroundColor: "#a3c85a" },
//           ]}
//           disabled={!profileMobile || !profileEmail}
//           onPress={saveChanges}
//         >
//           <Text style={styles.saveButtonText}>💾 Save Changes</Text>
//         </TouchableOpacity>

//         {/* Menu Section (Help only) */}
//         <View style={styles.menuSection}>
//           <TouchableOpacity style={styles.menuItem} onPress={showHelp}>
//             <Ionicons name="help-circle-outline" size={26} color="#7f9c3a" />
//             <Text style={[styles.menuText, { color: "#556b2f" }]}>Help</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   page: { flex: 1, backgroundColor: "#FFFFFF" },

//   // Header row
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     textAlign: "center",
//   },

//   // Container
//   container: {
//     paddingBottom: 60,
//   },

//   // Profile Image
//   imageContainer: {
//     alignSelf: "center",
//     marginVertical: 20,
//     position: "relative",
//   },
//   profileImage: { resizeMode: "cover" },
//   placeholder: {
//     backgroundColor: "#edf197ff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#eaf165ff",
//   },
//   addPhotoText: { marginTop: 8, fontSize: 14 },
//   editIconContainer: {
//     position: "absolute",
//     bottom: 5,
//     right: 5,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#fff",
//   },

//   name: {
//     color: "#228B22",
//     fontWeight: "700",
//     textAlign: "center",
//     fontSize: 22,
//     marginBottom: 16,
//   },

//   // Card
//   card: {
//     borderRadius: 14,
//     padding: 16,
//     marginHorizontal: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//   },

//   // Input group
//   inputGroup: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#c5da8a",
//     marginBottom: 14,
//     paddingVertical: 6,
//   },
//   inputIcon: { marginRight: 10 },
//   input: {
//     flex: 1,
//     fontSize: 15,
//     color: "#556B2F",
//   },

//   // Save button
//   saveButton: {
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: "center",
//     marginHorizontal: 16,
//   },
//   saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

//   // Menu Section
//   menuSection: {
//     marginTop: 30,
//     backgroundColor: "#f2f8db",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#c5da8a",
//     overflow: "hidden",
//     marginHorizontal: 16,
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   menuText: {
//     fontSize: 16,
//     marginLeft: 15,
//     fontWeight: "500",
//   },
// });


// app/Profile.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AuthService, { type AuthResponse } from "../app/api/AuthService";
import ApiClient from "../app/api/ApiClient";

interface UserProfile {
  _id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  isActive: boolean;
  aadharNumber?: string;
  roomSharingPreference?: string;
  aadharDocument?: {
    filename: string;
    originalName: string;
    path: string;
    url: string;
    uploadDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth * 0.35;

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get user data from AsyncStorage (cached)
      const storedData = await AuthService.getUserData();
      
      if (storedData && storedData.user) {
        setUserProfile(storedData.user);
      }

      // Also try to fetch from API endpoint if available
      try {
        const apiResponse = await ApiClient.get<any>('/students/profile');
        if (apiResponse.success && apiResponse.user) {
          setUserProfile(apiResponse.user);
        }
      } catch (apiError) {
        console.log("API profile fetch failed, using cached data");
        // Continue with cached data if API fails
      }
      
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Call logout API endpoint if exists
              await ApiClient.post('/students/logout');
            } catch (error) {
              console.log("Logout API error (might not exist):", error);
            } finally {
              await AuthService.logout();
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getRoomSharingText = (preference?: string) => {
    if (!preference) return "Not specified";
    
    const map: Record<string, string> = {
      'single': 'Single',
      'double': 'Double',
      'triple': 'Triple',
      'four': '4 Sharing',
      'five': '5 Sharing',
      'six': '6 Sharing',
      'seven': '7 Sharing',
      'eight': '8 Sharing',
      'nine': '9 Sharing',
      'ten': '10 Sharing',
    };
    
    return map[preference.toLowerCase()] || preference;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.page, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#228B22" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.page, styles.centerContainer]}>
        <Ionicons name="alert-circle-outline" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>No profile data found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: '#6c757d', marginTop: 10 }]} 
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.page, { paddingTop: insets.top || 20 }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#228B22"]}
            tintColor="#228B22"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#228B22" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👤 My Profile</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Ionicons 
              name={refreshing ? "refresh" : "refresh-outline"} 
              size={24} 
              color="#228B22" 
            />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
          <View style={[styles.placeholder, { 
            width: imageSize, 
            height: imageSize, 
            borderRadius: imageSize / 2 
          }]}>
            <Ionicons name="person" size={imageSize * 0.5} color="#fff" />
          </View>
          {userProfile.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>✓ Active</Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <Text style={styles.name}>{userProfile.fullName}</Text>
        <Text style={styles.userId}>Student ID: {userProfile._id.substring(0, 8)}...</Text>

        {/* Profile Details Card */}
        <View style={styles.card}>
          {/* Contact Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#228B22" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            
            <DetailRow 
              icon="call-outline"
              label="Mobile Number"
              value={userProfile.mobileNumber}
            />
            
            <DetailRow 
              icon="mail-outline"
              label="Email Address"
              value={userProfile.email}
            />
            
            {userProfile.aadharNumber && (
              <DetailRow 
                icon="card-outline"
                label="Aadhar Number"
                value={userProfile.aadharNumber}
              />
            )}
          </View>

          {/* Room Preference */}
          {userProfile.roomSharingPreference && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bed-outline" size={20} color="#228B22" />
                <Text style={styles.sectionTitle}>Room Preference</Text>
              </View>
              <DetailRow 
                icon="people-outline"
                label="Sharing Preference"
                value={getRoomSharingText(userProfile.roomSharingPreference)}
              />
            </View>
          )}

          {/* Account Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#228B22" />
              <Text style={styles.sectionTitle}>Account Information</Text>
            </View>
            
            <DetailRow 
              icon="calendar-outline"
              label="Member Since"
              value={formatDate(userProfile.createdAt)}
            />
            
            <DetailRow 
              icon="calendar-outline"
              label="Last Updated"
              value={formatDate(userProfile.updatedAt)}
            />
            
            <View style={styles.statusRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#228B22" />
              <View style={styles.statusContent}>
                <Text style={styles.detailLabel}>Account Status</Text>
                <View style={[
                  styles.statusBadge,
                  userProfile.isActive ? styles.activeStatus : styles.inactiveStatus
                ]}>
                  <Text style={styles.statusText}>
                    {userProfile.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Aadhar Document */}
        {userProfile.aadharDocument && (
          <View style={[styles.card, { marginTop: 10 }]}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={20} color="#228B22" />
                <Text style={styles.sectionTitle}>Aadhar Document</Text>
              </View>
              
              <View style={styles.documentRow}>
                <Ionicons name="document-attach-outline" size={20} color="#666" />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {userProfile.aadharDocument.originalName}
                  </Text>
                  <Text style={styles.documentDate}>
                    Uploaded: {formatDate(userProfile.aadharDocument.uploadDate)}
                  </Text>
                </View>
                {userProfile.aadharDocument.url && (
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => {
                      // You can implement document viewing here
                      Alert.alert(
                        "View Document",
                        `Document URL: ${userProfile.aadharDocument?.url}`,
                        [{ text: "OK" }]
                      );
                    }}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Hostel Management System v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Detail Row Component
function DetailRow({ icon, label, value }: { 
  icon: string; 
  label: string; 
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={20} color="#666" />
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: "#FFFFFF" 
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8fff8",
    borderBottomWidth: 1,
    borderBottomColor: "#e8f5e8",
  },
  backButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#228B22",
  },
  imageContainer: {
    alignSelf: "center",
    marginVertical: 24,
    position: "relative",
  },
  placeholder: {
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#E8F5E9",
  },
  activeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  activeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  name: {
    color: "#1B5E20",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 26,
    marginBottom: 4,
  },
  userId: {
    color: "#757575",
    textAlign: "center",
    fontSize: 13,
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1B5E20",
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingLeft: 4,
  },
  detailContent: {
    marginLeft: 14,
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#212121",
    fontWeight: "500",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingLeft: 4,
  },
  statusContent: {
    marginLeft: 14,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  activeStatus: {
    backgroundColor: "#E8F5E9",
  },
  inactiveStatus: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1B5E20",
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  documentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    color: "#424242",
    fontWeight: "500",
  },
  documentDate: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  viewButtonText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
  actionButtons: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
  },
  logoutButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F44336",
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#228B22",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  versionText: {
    textAlign: "center",
    color: "#9E9E9E",
    fontSize: 12,
    marginTop: 32,
    marginBottom: 16,
  },
});