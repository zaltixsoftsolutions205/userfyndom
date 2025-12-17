// BookingForm.tsx - FIXED VERSION
import { useAppSelector } from "@/hooks/hooks";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

// Interfaces
interface HostelData {
  _id: string;
  hostelName: string;
  address: string;
  contact: string;
  email: string;
  hostelType: string;
  pricing: {
    single?: RoomPricing;
    double?: RoomPricing;
    triple?: RoomPricing;
    four?: RoomPricing;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  startingPrice: number;
  photos: any[];
  summary: string;
}

interface RoomPricing {
  daily: {
    price: number;
    currency: string;
  };
  monthly: {
    price: number;
    currency: string;
  };
  availableBeds: number;
}

interface AadhaarFile {
  uri: string;
  name: string;
  type: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  key: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
  data: {
    booking: {
      _id: string;
      student: string;
      hostelOwner: string;
      room: string;
      sharingType: string;
      durationType: string;
      price: number;
      amountPaid: number;
      checkInDate: string;
      duration: number;
      paymentStatus: string;
      bookingStatus: string;
      razorpayOrderId: string;
    };
    razorpayOrder: RazorpayOrder;
    payment: {
      totalAmount: number;
      transferAmount: number;
      platformFee: number;
    };
    studentDetails: {
      name: string;
      email: string;
      contact: string;
    };
  };
}

export default function BookingForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, userId } = useAppSelector((state) => state.auth);

  // Parse the hostel data safely
  let hostelData: HostelData | null = null;
  try {
    if (params.hostel) {
      hostelData = JSON.parse(params.hostel as string);
    }
  } catch (error) {
    console.log('❌ Error parsing hostel data:', error);
  }

  const selectedSharing = params.selectedSharing as string;
  const monthlyPrice = params.monthlyPrice as string;
  const dailyPrice = params.dailyPrice as string;

  const [fullName, setFullName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [aadhaarNumber, setAadhaarNumber] = useState<string>("");
  const [aadhaarFiles, setAadhaarFiles] = useState<AadhaarFile[]>([]);
  const [durationType, setDurationType] = useState<"monthly" | "daily">("monthly");
  const [duration, setDuration] = useState<string>("1");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<RazorpayOrder | null>(null);

  // Calculate total amount when duration or type changes
  useEffect(() => {
    if (!monthlyPrice || !dailyPrice) return;

    const basePrice = durationType === "monthly"
      ? parseFloat(monthlyPrice)
      : parseFloat(dailyPrice);

    const total = basePrice * parseInt(duration || "1");
    setTotalAmount(total);
  }, [durationType, duration, monthlyPrice, dailyPrice]);

  // Aadhaar Upload
  const handleAadhaarUpload = async (): Promise<void> => {
    try {
      setIsUploading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Gallery access is needed to upload Aadhaar'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const newFile: AadhaarFile = {
          uri: file.uri,
          name: `aadhaar_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };
        setAadhaarFiles([newFile]);
        Toast.show({
          type: "success",
          text1: "Aadhaar Uploaded",
          text2: "Aadhaar image uploaded successfully",
        });
      }
    } catch (err) {
      console.error('Aadhaar upload error:', err);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to upload Aadhaar" });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove Aadhaar file
  const removeAadhaarFile = (): void => {
    setAadhaarFiles([]);
  };

  // Validation
  const validateForm = (): boolean => {
    if (!fullName || fullName.trim().length < 3) {
      Toast.show({ type: "error", text1: "Invalid Name", text2: "Enter at least 3 characters" });
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Toast.show({ type: "error", text1: "Invalid Mobile", text2: "Enter a valid 10-digit number" });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: "error", text1: "Invalid Email", text2: "Enter a valid email address" });
      return false;
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      Toast.show({ type: "error", text1: "Invalid Aadhaar", text2: "Must be 12 digits" });
      return false;
    }
    if (aadhaarFiles.length === 0) {
      Toast.show({ type: "error", text1: "Missing Aadhaar", text2: "Please upload Aadhaar image" });
      return false;
    }
    if (!duration || parseInt(duration) < 1) {
      Toast.show({ type: "error", text1: "Invalid Duration", text2: "Please select valid duration" });
      return false;
    }
    if (!hostelData?._id) {
      Toast.show({ type: "error", text1: "Hostel Error", text2: "Hostel information is missing" });
      return false;
    }
    return true;
  };

  // In your BookingForm.tsx - UPDATE THE handleProceedToPayment function:

  // Replace the existing handleProceedToPayment function with this:
  const handleProceedToPayment = async (): Promise<void> => {
    console.log('🚀 Starting payment process...');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsLoading(true);

    try {
      if (!token) {
        Toast.show({ type: "error", text1: "Authentication Error", text2: "Please login again" });
        return;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('hostelOwnerId', hostelData!._id);
      formData.append('sharingType', selectedSharing);
      formData.append('durationType', durationType);
      formData.append('duration', duration);
      formData.append('checkInDate', new Date().toISOString().split('T')[0]);
      formData.append('aadharNumber', aadhaarNumber);
      formData.append('roomSharingPreference', selectedSharing);

      // Append Aadhaar file
      if (aadhaarFiles.length > 0) {
        formData.append('aadharDocument', {
          uri: aadhaarFiles[0].uri,
          type: 'image/jpeg',
          name: aadhaarFiles[0].name,
        } as any);
      }

      // Create booking and get Razorpay order
      const response = await fetch('https://api.fyndom.in/api/bookings/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ HTTP error:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          Toast.show({ type: "error", text1: "Booking Failed", text2: errorJson.message || 'Unknown error' });
        } catch {
          Toast.show({ type: "error", text1: "HTTP Error", text2: `Status: ${response.status}` });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BookingResponse = await response.json();
      console.log('✅ Booking response:', result);

      if (result.success) {
        // Navigate to Razorpay Payment Screen with all required parameters
        router.push({
          pathname: '/screens/RazorpayPaymentScreen',
          params: {
            razorpayOrder: JSON.stringify(result.data.razorpayOrder),
            studentDetails: JSON.stringify(result.data.studentDetails),
            bookingId: result.data.booking._id,
            hostelName: hostelData?.hostelName,
            sharingType: selectedSharing,
            durationType: durationType,
            duration: duration,
            totalAmount: totalAmount.toString()
          }
        });

      } else {
        Toast.show({ type: "error", text1: "Booking Failed", text2: result.message });
      }
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: error.message || "Failed to create booking"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Open Razorpay in Browser (Fallback solution)
  const openRazorpayInBrowser = async (order: RazorpayOrder, studentDetails: any) => {
    try {
      // Create proper Razorpay checkout URL
      const successUrl = `https://api.fyndom.in/api/bookings/payment-success?order_id=${order.id}&booking_id=${currentBookingId}`;

      const checkoutUrl = `https://razorpay.com/payment-button/${order.key}/pay/?amount=${order.amount}&currency=${order.currency}&order_id=${order.id}&name=${encodeURIComponent(hostelData?.hostelName || 'Hostel Booking')}&description=${encodeURIComponent(`Booking for ${selectedSharing} sharing - ${duration} ${durationType}`)}&prefill[name]=${encodeURIComponent(studentDetails.name)}&prefill[email]=${encodeURIComponent(studentDetails.email)}&prefill[contact]=${encodeURIComponent(studentDetails.contact)}&callback_url=${encodeURIComponent(successUrl)}`;

      console.log('🔗 Opening Razorpay URL:', checkoutUrl);

      // Open in browser
      const { Linking } = require('react-native');
      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (canOpen) {
        await Linking.openURL(checkoutUrl);

        Toast.show({
          type: "info",
          text1: "Opening Payment Gateway",
          text2: "Complete payment in the browser"
        });

        // Start polling for payment status
        startPaymentStatusPolling();
      } else {
        Toast.show({
          type: "error",
          text1: "Cannot Open Payment",
          text2: "Please install a web browser"
        });
      }
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      Toast.show({
        type: "error",
        text1: "Payment Error",
        text2: "Failed to open payment gateway"
      });
    }
  };

  // Poll for payment status
  const startPaymentStatusPolling = () => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5 seconds × 60)

    const pollInterval = setInterval(async () => {
      attempts++;

      try {
        if (!currentBookingId) {
          console.log('❌ No booking ID for polling');
          clearInterval(pollInterval);
          return;
        }

        console.log(`🔄 Polling payment status (attempt ${attempts}) for booking:`, currentBookingId);

        const statusResponse = await fetch(`https://api.fyndom.in/api/bookings/payment-status/${currentBookingId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('📊 Payment status:', statusData);

          if (statusData.data.paymentStatus === 'completed') {
            clearInterval(pollInterval);
            Toast.show({
              type: "success",
              text1: "Payment Successful!",
              text2: "Your booking has been confirmed"
            });

            // Redirect to bookings page
            setTimeout(() => {
              router.replace('/(tabs)/Bookings');
            }, 2000);
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          Toast.show({
            type: "info",
            text1: "Payment Pending",
            text2: "Please check your bookings page for status"
          });
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 5000); // Poll every 5 seconds
  };

  // Manual payment verification (fallback)
  const handleManualVerification = async () => {
    if (!currentBookingId) {
      Toast.show({
        type: "error",
        text1: "No Booking Found",
        text2: "Please create a booking first"
      });
      return;
    }

    Alert.alert(
      "Payment Verification",
      "If you have completed the payment but still see pending status, click Verify to check payment status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify Payment",
          onPress: async () => {
            try {
              const response = await fetch(`https://api.fyndom.in/api/bookings/payment-status/${currentBookingId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const data = await response.json();
                if (data.data.paymentStatus === 'completed') {
                  Toast.show({
                    type: "success",
                    text1: "Payment Verified!",
                    text2: "Your booking is confirmed"
                  });
                  router.replace('/(tabs)/Bookings');
                } else {
                  Toast.show({
                    type: "info",
                    text1: "Payment Pending",
                    text2: "Your payment is still being processed"
                  });
                }
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Verification Failed",
                text2: "Please try again later"
              });
            }
          }
        }
      ]
    );
  };

  const getSharingDisplayText = (sharingType: string): string => {
    const sharingMap: { [key: string]: string } = {
      single: "1 Sharing",
      double: "2 Sharing",
      triple: "3 Sharing",
      four: "4 Sharing"
    };
    return sharingMap[sharingType] || sharingType;
  };

  const getDurationOptions = () => {
    if (durationType === 'monthly') {
      return [
        <Picker.Item key="1" label="1 Month" value="1" />,
        <Picker.Item key="2" label="2 Months" value="2" />,
        <Picker.Item key="3" label="3 Months" value="3" />,
        <Picker.Item key="6" label="6 Months" value="6" />,
        <Picker.Item key="12" label="12 Months" value="12" />,
      ];
    } else {
      return [
        <Picker.Item key="1" label="1 Day" value="1" />,
        <Picker.Item key="2" label="2 Days" value="2" />,
        <Picker.Item key="3" label="3 Days" value="3" />,
        <Picker.Item key="7" label="7 Days" value="7" />,
        <Picker.Item key="15" label="15 Days" value="15" />,
        <Picker.Item key="30" label="30 Days" value="30" />,
      ];
    }
  };

  if (!hostelData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="warning-outline" size={50} color="#ff6b6b" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' }}>
          Hostel Data Not Found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.paymentBtn, { backgroundColor: '#4CBB17' }]}
        >
          <Text style={styles.paymentText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#155a46" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Hostel</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subTitle}>
          Booking for: <Text style={{ color: "#2563eb" }}>{hostelData?.hostelName}</Text>
        </Text>

        {/* Selected Room Type */}
        <View style={styles.selectedRoomCard}>
          <Text style={styles.selectedRoomTitle}>Selected Room</Text>
          <Text style={styles.selectedRoomType}>
            {getSharingDisplayText(selectedSharing)}
          </Text>
          <Text style={styles.selectedRoomPrice}>
            ₹{durationType === 'monthly' ? monthlyPrice : dailyPrice} / {durationType === 'monthly' ? 'month' : 'day'}
          </Text>
          {currentBookingId && (
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Booking ID: {currentBookingId}
            </Text>
          )}
        </View>

        {/* Rest of the form remains the same */}
        <View style={styles.card}>
          {/* Form fields */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile"
            keyboardType="numeric"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
            editable={!isLoading}
          />

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <Text style={styles.label}>Duration Type *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: "Monthly", value: "monthly" },
              { label: "Daily", value: "daily" }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => setDurationType(option.value as "monthly" | "daily")}
                disabled={isLoading}
              >
                <View style={styles.radioCircle}>
                  {durationType === option.value && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            Duration ({durationType === 'monthly' ? 'Months' : 'Days'}) *
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={duration}
              onValueChange={(value) => setDuration(value)}
              enabled={!isLoading}
            >
              {getDurationOptions()}
            </Picker>
          </View>

          <Text style={styles.label}>Aadhaar Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 12-digit Aadhaar number"
            keyboardType="numeric"
            maxLength={12}
            value={aadhaarNumber}
            onChangeText={setAadhaarNumber}
            editable={!isLoading}
          />

          <Text style={styles.label}>Upload Aadhaar Card (JPG/PNG) *</Text>
          <TouchableOpacity
            style={[
              styles.uploadBtn,
              (isLoading || isUploading) && styles.uploadBtnDisabled
            ]}
            onPress={handleAadhaarUpload}
            disabled={isLoading || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#f9bc02" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#f9bc02" />
                <Text style={styles.uploadText}>Upload Aadhaar Image</Text>
              </>
            )}
          </TouchableOpacity>

          {aadhaarFiles.length > 0 && (
            <View style={styles.filePreview}>
              <Image source={{ uri: aadhaarFiles[0].uri }} style={styles.previewImage} />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {aadhaarFiles[0].name}
                </Text>
                <TouchableOpacity onPress={removeAadhaarFile} disabled={isLoading}>
                  <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Payment Summary */}
          <View style={styles.paymentSummary}>
            <Text style={styles.paymentTitle}>Payment Summary</Text>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Room Charges:</Text>
              <Text style={styles.paymentValue}>
                ₹{durationType === 'monthly' ? monthlyPrice : dailyPrice} × {duration} {durationType === 'monthly' ? 'month(s)' : 'day(s)'}
              </Text>
            </View>
            <View style={styles.paymentTotalRow}>
              <Text style={styles.paymentTotalLabel}>Total Amount:</Text>
              <Text style={styles.paymentTotalValue}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Button */}
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[
              styles.paymentBtn,
              (isLoading || totalAmount === 0) && styles.paymentBtnDisabled
            ]}
            onPress={handleProceedToPayment}
            disabled={isLoading || totalAmount === 0}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.paymentText}>Pay ₹{totalAmount.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>

          {currentBookingId && (
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleManualVerification}
            >
              <Text style={styles.verifyText}>Verify Payment Status</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.note}>
            You will be redirected to Razorpay secure payment gateway
          </Text>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

// Styles remain the same as previous version
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#155a46",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#374151",
  },
  selectedRoomCard: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  selectedRoomTitle: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  selectedRoomType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#155a46",
    marginBottom: 4,
  },
  selectedRoomPrice: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#155a46",
  },
  radioLabel: {
    fontSize: 14,
    color: "#374151",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#f9fafb",
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadText: {
    color: "#d97706",
    fontWeight: "600",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  paymentSummary: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#155a46",
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  paymentValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  paymentTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#155a46",
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  paymentSection: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#155a46",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  paymentBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  paymentText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  verifyBtn: {
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
  },
  verifyText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "500",
  },
  note: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },
});