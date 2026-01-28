// BookingForm.tsx - COMPLETE VERSION with Check-in Date & Razorpay Integration
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
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get("window");

// Interfaces
interface HostelData {
  _id: string;
  hostelOwnerId?: string;
  hostelName: string;
  address: string;
  contact: string;
  email: string;
  hostelType: string;
  pricing: any;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  startingPrice: number;
  photos: any[];
  summary: string;
}

interface AadhaarFile {
  uri: string;
  name: string;
  type: string;
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    hostelId: string;
    hostelName: string;
    roomNumber: string;
    sharingType: string;
    price: number;
    razorpayOrder?: RazorpayOrder;
  };
}

interface CreateOrderResponse {
  success: boolean;
  data: RazorpayOrder;
}

interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export default function BookingForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, user } = useAppSelector((state) => state.auth);

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
  const availableBeds = params.availableBeds as string;

  // State variables
  const [fullName, setFullName] = useState<string>(user?.fullName || "");
  const [mobile, setMobile] = useState<string>(user?.mobileNumber || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [aadhaarNumber, setAadhaarNumber] = useState<string>("");
  const [aadhaarFiles, setAadhaarFiles] = useState<AadhaarFile[]>([]);
  const [durationType, setDurationType] = useState<"monthly" | "daily">("monthly");
  const [duration, setDuration] = useState<string>("1");
  
  // Check-in date state
  const [checkInDate, setCheckInDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [razorpayOrder, setRazorpayOrder] = useState<RazorpayOrder | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Ensure selected date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        Toast.show({
          type: "error",
          text1: "Invalid Date",
          text2: "Check-in date cannot be in the past"
        });
        return;
      }
      setCheckInDate(selectedDate);
    }
  };

  // Show date picker
  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

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
    
    // Check-in date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      Toast.show({ type: "error", text1: "Invalid Date", text2: "Check-in date cannot be in the past" });
      return false;
    }
    
    if (!hostelData?._id && !hostelData?.hostelOwnerId) {
      Toast.show({ type: "error", text1: "Hostel Error", text2: "Hostel information is missing" });
      return false;
    }
    
    // Check bed availability
    if (availableBeds && parseInt(availableBeds) <= 0) {
      Toast.show({ type: "error", text1: "Room Unavailable", text2: "This room type is sold out" });
      return false;
    }
    
    return true;
  };

  // Create Booking (Step 1)
  const createBooking = async (): Promise<BookingResponse | null> => {
    console.log('📝 Creating booking...');
    
    try {
      if (!token) {
        Toast.show({ type: "error", text1: "Authentication Error", text2: "Please login again" });
        return null;
      }

      // Prepare form data
      const formData = new FormData();
      
      // Use hostelOwnerId if available, otherwise use _id
      const hostelId = hostelData?.hostelOwnerId || hostelData?._id;
      if (!hostelId) {
        throw new Error('Hostel ID not found');
      }
      
      formData.append('hostelId', hostelId);
      formData.append('fullName', fullName);
      formData.append('mobileNumber', mobile);
      formData.append('email', email);
      formData.append('durationType', durationType);
      formData.append('duration', duration);
      formData.append('checkInDate', formatDateForAPI(checkInDate));
      formData.append('aadharNumber', aadhaarNumber);
      formData.append('roomSharingPreference', selectedSharing);

      // Append Aadhaar file
      if (aadhaarFiles.length > 0) {
        formData.append('aadharCardPhoto', {
          uri: aadhaarFiles[0].uri,
          type: 'image/jpeg',
          name: aadhaarFiles[0].name,
        } as any);
      }

      console.log('📤 Booking payload:', {
        hostelId,
        fullName,
        mobile,
        email,
        durationType,
        duration,
        checkInDate: formatDateForAPI(checkInDate),
        aadhaarNumber: aadhaarNumber,
        sharingType: selectedSharing
      });

      // Create booking
      const response = await fetch('http://192.168.29.230:5000/api/student/bookings?', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ HTTP error:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          Toast.show({ 
            type: "error", 
            text1: "Booking Failed", 
            text2: errorJson.message || `Error ${response.status}` 
          });
        } catch {
          Toast.show({ 
            type: "error", 
            text1: "HTTP Error", 
            text2: `Status: ${response.status}` 
          });
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BookingResponse = await response.json();
      console.log('✅ Booking created:', result);

      if (result.success) {
        setCurrentBookingId(result.data.bookingId);
        Toast.show({
          type: "success",
          text1: "Booking Created",
          text2: "Booking created successfully. Creating payment order..."
        });
        return result;
      } else {
        Toast.show({ 
          type: "error", 
          text1: "Booking Failed", 
          text2: result.message 
        });
        return null;
      }
    } catch (error: any) {
      console.error('❌ Booking creation error:', error);
      Toast.show({
        type: "error",
        text1: "Booking Error",
        text2: error.message || "Failed to create booking"
      });
      return null;
    }
  };

  // Create Razorpay Order (Step 2)
  const createRazorpayOrder = async (bookingId: string): Promise<RazorpayOrder | null> => {
    console.log('💰 Creating Razorpay order for booking:', bookingId);
    
    try {
      setIsCreatingOrder(true);
      
      const response = await fetch(`http://192.168.29.230:5000/api/student/bookings/${bookingId}/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Razorpay order creation failed:', errorText);
        throw new Error(`Failed to create payment order: ${response.status}`);
      }

      const result: CreateOrderResponse = await response.json();
      console.log('✅ Razorpay order created:', result);

      if (result.success) {
        setRazorpayOrder(result.data);
        return result.data;
      } else {
        throw new Error('Failed to create payment order');
      }
    } catch (error: any) {
      console.error('❌ Razorpay order error:', error);
      Toast.show({
        type: "error",
        text1: "Payment Error",
        text2: error.message || "Failed to create payment order"
      });
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Verify Payment (Step 3)
  const verifyPayment = async (paymentData: PaymentVerificationData): Promise<boolean> => {
    console.log('🔐 Verifying payment:', paymentData);
    
    try {
      setIsVerifyingPayment(true);
      
      const response = await fetch('http://192.168.29.230:5000/api/student/bookings/verify-payment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Payment verification failed:', errorText);
        throw new Error(`Payment verification failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Payment verification result:', result);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Payment Successful!",
          text2: "Your booking has been confirmed"
        });
        return true;
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('❌ Payment verification error:', error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.message || "Failed to verify payment"
      });
      return false;
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Complete Payment Flow
  const handleProceedToPayment = async (): Promise<void> => {
    console.log('🚀 Starting complete payment flow...');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Booking
      const bookingResult = await createBooking();
      if (!bookingResult || !bookingResult.data.bookingId) {
        throw new Error('Failed to create booking');
      }

      // Step 2: Create Razorpay Order
      const razorpayOrder = await createRazorpayOrder(bookingResult.data.bookingId);
      if (!razorpayOrder) {
        throw new Error('Failed to create payment order');
      }

      // Step 3: Navigate to Razorpay Payment Screen
      router.push({
        pathname: '/screens/RazorpayPaymentScreen',
        params: {
          razorpayOrder: JSON.stringify(razorpayOrder),
          studentDetails: JSON.stringify({
            name: fullName,
            email: email,
            contact: mobile
          }),
          bookingId: bookingResult.data.bookingId,
          hostelName: hostelData?.hostelName || 'Hostel',
          sharingType: selectedSharing,
          durationType: durationType,
          duration: duration,
          totalAmount: totalAmount.toString(),
          checkInDate: formatDateForAPI(checkInDate)
        }
      });

    } catch (error: any) {
      console.error('❌ Payment flow error:', error);
      Toast.show({
        type: "error",
        text1: "Payment Flow Error",
        text2: error.message || "Failed to proceed with payment"
      });
    } finally {
      setIsLoading(false);
    }
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
      "If you have completed the payment but still see pending status, enter your payment details below.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify Payment",
          onPress: async () => {
            Alert.prompt(
              "Payment Verification",
              "Enter Razorpay Payment ID:",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Verify",
                  onPress: async (paymentId) => {
                    if (!paymentId) {
                      Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "Payment ID is required"
                      });
                      return;
                    }

                    try {
                      // This is a simplified verification - in production, you'd need
                      // to get the order ID and signature from your backend
                      Toast.show({
                        type: "info",
                        text1: "Verifying...",
                        text2: "Please check your bookings page for status"
                      });
                      
                      // Navigate to bookings page
                      setTimeout(() => {
                        router.replace('/(tabs)/Bookings');
                      }, 2000);
                    } catch (error) {
                      Toast.show({
                        type: "error",
                        text1: "Verification Failed",
                        text2: "Please try again later"
                      });
                    }
                  }
                }
              ],
              'plain-text'
            );
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
      four: "4 Sharing",
      five: "5 Sharing",
      six: "6 Sharing",
      seven: "7 Sharing",
      eight: "8 Sharing",
      nine: "9 Sharing",
      ten: "10 Sharing"
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
          {availableBeds && (
            <Text style={styles.availabilityText}>
              Available Beds: {availableBeds}
            </Text>
          )}
          {currentBookingId && (
            <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Booking ID: {currentBookingId}
            </Text>
          )}
        </View>

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

          {/* Check-in Date */}
          <Text style={styles.label}>Check-in Date *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={showDatePickerModal}
            disabled={isLoading}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>
              {formatDate(checkInDate)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          
          {showDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal
                transparent={true}
                animationType="slide"
                visible={showDatePicker}
              >
                <View style={styles.datePickerModal}>
                  <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.datePickerCancel}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.datePickerTitle}>Select Check-in Date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.datePickerDone}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={checkInDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )
          )}

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
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Check-in Date:</Text>
              <Text style={styles.paymentValue}>
                {formatDate(checkInDate)}
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
            {isLoading || isCreatingOrder ? (
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

// Styles
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
  availabilityText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontStyle: 'italic',
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
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },
  dateText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    marginLeft: 10,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  datePickerCancel: {
    fontSize: 16,
    color: "#666",
  },
  datePickerDone: {
    fontSize: 16,
    color: "#219150",
    fontWeight: "600",
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