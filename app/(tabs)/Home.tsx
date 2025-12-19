// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter, useFocusEffect } from "expo-router";
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Dimensions,
//   Image,
//   FlatList,
//   Modal,
//   Platform,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   ImageSourcePropType,
//   ImageBackground,
//   Share,
//   Alert,
//   Keyboard,
//   Animated,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as Location from "expo-location";
// import ApiClient from '../../app/api/ApiClient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const { width, height } = Dimensions.get("window");

// const nearbyIcon = require("../../assets/icons/nearby.png");
// const kukatpallyIcon = require("../../assets/icons/kukatpally.png");
// const lbNagarIcon = require("../../assets/icons/dilsukhnagar.png");
// const secunderabadIcon = require("../../assets/icons/secunderabad.png");
// const ameerpetIcon = require("../../assets/icons/ameerpet.png");
// const hitechCityIcon = require("../../assets/icons/hitech_city.png");
// const madhapurIcon = require("../../assets/icons/madhapur.jpg");
// const begumpetIcon = require("../../assets/icons/begumpet.jpg");

// const referralBackgrounds = [
//   require("../../assets/images/referral_card_bg1.jpg"),
//   require("../../assets/images/referral_card_bg2.jpg"),
//   require("../../assets/images/referral_card_bg3.jpg"),
// ];

// type LocationType = {
//   key: string;
//   label: string;
//   icon: ImageSourcePropType;
// };

// const locations: LocationType[] = [
//   { key: "nearby", label: "Nearby", icon: nearbyIcon },
//   { key: "kukatpally", label: "Kukatpally", icon: kukatpallyIcon },
//   { key: "lb_nagar", label: "Dilsukhnagar", icon: lbNagarIcon },
//   { key: "secunderabad", label: "Secunderabad", icon: secunderabadIcon },
//   { key: "ameerpet", label: "Ameerpet", icon: ameerpetIcon },
//   { key: "hitech_city", label: "Hitech City", icon: hitechCityIcon },
//   { key: "madhapur", label: "Madhapur", icon: madhapurIcon },
//   { key: "begumpet", label: "Begumpet", icon: begumpetIcon },
// ];

// const banners = [
//   { img: require("../../assets/banner1.jpg") },
//   { img: require("../../assets/banner2.jpg") },
//   { img: require("../../assets/banner3.jpg") },
//   { img: require("../../assets/banner4.jpg") },
// ];

// const offers = [
//   { title: "50% Off on First Booking", icon: require("../../assets/icons/first-booking.jpg") },
//   { title: "Book 3 Get 1 Free", icon: require("../../assets/icons/discount.jpg") },
//   { title: "Refer and Win ₹250", icon: require("../../assets/icons/referrals.jpg") },
//   { title: "Festive Offer", icon: require("../../assets/icons/festive.png") },
// ];

// const referCards = [
//   {
//     title: "Earn ₹250 for each referral",
//     desc: "Invite your friends and earn",
//     icon: "gift",
//     bgImage: referralBackgrounds[0],
//   },
//   {
//     title: "Unlock exclusive rewards",
//     desc: "As your friends sign up",
//     icon: "key",
//     bgImage: referralBackgrounds[1],
//   },
//   {
//     title: "Track referral status easily",
//     desc: "All in one place",
//     icon: "checkmark-circle",
//     bgImage: referralBackgrounds[2],
//   },
// ];

// const amenitiesOptions = ["AC", "Wi-Fi", "Parking", "Verified Hostels", "Washing Machine", "Drinking Water"];
// const sharingOptions = [1, 2, 3, 4, 5];
// const genderOptions = ["Boys", "Girls", "Co-living"];

// // Interface for API response
// interface Hostel {
//   _id: string;
//   hostelName: string;
//   address: string;
//   contact: string;
//   email: string;
//   hostelType?: string;
//   photos: Array<{
//     filename: string;
//     originalName: string;
//     path: string;
//     url: string;
//     isPrimary: boolean;
//     _id: string;
//     uploadDate: string;
//   }>;
//   summary: string;
//   startingPrice: number;
//   pricing: {
//     single: {
//       daily: { price: number; currency: string } | null;
//       monthly: { price: number; currency: string } | null;
//       availableBeds: number;
//     };
//     double: {
//       daily: { price: number; currency: string } | null;
//       monthly: { price: number; currency: string } | null;
//       availableBeds: number;
//     };
//     triple: {
//       daily: { price: number; currency: string } | null;
//       monthly: { price: number; currency: string } | null;
//       availableBeds: number;
//     };
//     four: {
//       daily: { price: number; currency: string } | null;
//       monthly: { price: number; currency: string } | null;
//       availableBeds: number;
//     };
//   };
//   facilities: {
//     roomSharingTypes: Array<{ roomType: string; sharingType: string; _id: string }>;
//     bathroomTypes: string[];
//     essentials: string[];
//     foodServices: string[];
//   };
//   coordinates: {
//     latitude?: number;
//     longitude?: number;
//   } | null;
//   availabilitySummary: {
//     single: { availableBeds: number; totalBeds: number };
//     double: { availableBeds: number; totalBeds: number };
//     triple: { availableBeds: number; totalBeds: number };
//     four: { availableBeds: number; totalBeds: number };
//   };
// }

// interface HostelsResponse {
//   success: boolean;
//   data: Hostel[];
//   message: string;
//   pagination: {
//     current: number;
//     pages: number;
//     total: number;
//   };
// }

// export default function Home() {
//   const router = useRouter();

//   const [locationPermStatus, setLocationPermStatus] = useState<string>("");
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [detectedLocation, setDetectedLocation] = useState<string>("");

//   const [searchText, setSearchText] = useState("");
//   const [filterVisible, setFilterVisible] = useState(false);

//   const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
//   const [selectedSharingTypes, setSelectedSharingTypes] = useState<number[]>([]);
//   const [maxPrice, setMaxPrice] = useState(20000);
//   const [priceInput, setPriceInput] = useState(maxPrice.toString());
//   const [selectedGender, setSelectedGender] = useState<string>("");

//   const [selectedLocationKey, setSelectedLocationKey] = useState<string>("nearby");

//   // Hostel states
//   const [allHostels, setAllHostels] = useState<any[]>([]);
//   const [filteredHostels, setFilteredHostels] = useState<any[]>([]);
//   const [hostelsToShow, setHostelsToShow] = useState<any[]>([]);
//   const [forYouHostels, setForYouHostels] = useState<any[]>([]);
//   const [featuredHostels, setFeaturedHostels] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // User states
//   const [userName, setUserName] = useState<string>("Guest");
//   const [timeGreeting, setTimeGreeting] = useState<string>("Welcome Back");
//   const [userLoading, setUserLoading] = useState(true);

//   // Referral state
//   const [referralCode] = useState("FYNDOM250");
//   const [referralStats] = useState({
//     totalEarned: 1250,
//     successfulReferrals: 5,
//     pendingReferrals: 2
//   });

//   // Banner state and refs
//   const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
//   const bannerScrollRef = useRef<FlatList>(null);
//   const bannerPosition = useRef(new Animated.Value(0)).current;

//   // Check if any filters are active
//   const hasActiveFilters = selectedAmenities.length > 0 ||
//     selectedSharingTypes.length > 0 ||
//     selectedGender !== "" ||
//     maxPrice < 20000;

//   // Function to get time-based greeting
//   const getTimeBasedGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return "Good Morning";
//     if (hour < 17) return "Good Afternoon";
//     return "Good Evening";
//   };

//   // Function to fetch user data from AsyncStorage
//   const fetchUserData = async () => {
//     try {
//       setUserLoading(true);
      
//       // Try to get user data from AsyncStorage
//       const userDataString = await AsyncStorage.getItem('userData');
      
//       if (userDataString) {
//         const userData = JSON.parse(userDataString);
        
//         if (userData && userData.user && userData.user.fullName) {
//           // Extract first name from full name
//           const nameParts = userData.user.fullName.split(' ');
//           setUserName(nameParts[0] || userData.user.fullName);
//         } else if (userData && userData.user && userData.user.email) {
//           // Use email username as fallback
//           setUserName(userData.user.email.split('@')[0]);
//         } else {
//           setUserName("Guest");
//         }
//       } else {
//         // Check for access token to see if user is logged in
//         const token = await AsyncStorage.getItem('accessToken');
//         if (token) {
//           // User is logged in but no name found
//           setUserName("User");
//         } else {
//           setUserName("Guest");
//         }
//       }
      
//       // Set time-based greeting
//       setTimeGreeting(getTimeBasedGreeting());
      
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       setUserName("Guest");
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   // Function to fetch user profile from API (optional)
//   const fetchUserProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem('accessToken');
//       if (!token) return;

//       const response = await ApiClient.get('/students/profile');
//       if (response.success && response.data) {
//         const userData = response.data;
        
//         // Save to AsyncStorage
//         await AsyncStorage.setItem('userData', JSON.stringify({
//           user: userData,
//           role: 'student'
//         }));
        
//         // Update state
//         if (userData.fullName) {
//           const nameParts = userData.fullName.split(' ');
//           setUserName(nameParts[0] || userData.fullName);
//         } else if (userData.email) {
//           setUserName(userData.email.split('@')[0]);
//         }
        
//         setTimeGreeting(getTimeBasedGreeting());
//       }
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//     }
//   };

//   // Helper functions for data transformation
//   const determineGenderFromHostel = (hostel: Hostel): string => {
//     const name = hostel.hostelName?.toLowerCase() || '';
//     const type = hostel.hostelType?.toLowerCase() || '';

//     if (name.includes('boys') || name.includes('boy') || type === 'boys') return 'Boys';
//     if (name.includes('girls') || name.includes('girl') || type === 'girls') return 'Girls';
//     if (name.includes('women') || name.includes('womens')) return 'Girls';
//     return 'Co-living';
//   };

//   const extractLocationFromAddress = (address: string): string => {
//     if (!address) return 'Unknown Location';

//     const areas = [
//       'Kukatpally', 'L.B. Nagar', 'Secunderabad', 'Ameerpet',
//       'Hitech City', 'Madhapur', 'Begumpet', 'KPHB', 'Dilsukhnagar',
//       'Vizag', 'Visakhapatnam', 'Hyderabad', 'Trivendrum', 'Kerala'
//     ];

//     for (const area of areas) {
//       if (address.toLowerCase().includes(area.toLowerCase())) {
//         return area;
//       }
//     }

//     // Fallback: try to extract first meaningful word from address
//     const words = address.split(',').map(word => word.trim()).filter(word => word.length > 3);
//     return words[0] || 'Hyderabad';
//   };

//   const transformHostelData = (hostel: Hostel) => {
//     // Get primary photo or first photo
//     const primaryPhoto = hostel.photos?.find(photo => photo.isPrimary) || hostel.photos?.[0];

//     // Convert photo URL to absolute URL
//     let imageUrl = null;
//     if (primaryPhoto?.url) {
//       if (primaryPhoto.url.startsWith('http')) {
//         imageUrl = primaryPhoto.url;
//       } else {
//         const normalizedUrl = primaryPhoto.url.startsWith('/')
//           ? primaryPhoto.url
//           : `/${primaryPhoto.url}`;
//         imageUrl = `https://api.fyndom.in${normalizedUrl}`;
//       }
//     }

//     // Convert ALL photos to absolute URLs for details page
//     const allPhotos = hostel.photos?.map(photo => {
//       let photoUrl = photo.url;
//       if (photoUrl && !photoUrl.startsWith('http')) {
//         const normalizedUrl = photoUrl.startsWith('/')
//           ? photoUrl
//           : `/${photoUrl}`;
//         photoUrl = `https://api.fyndom.in${normalizedUrl}`;
//       }
//       return {
//         ...photo,
//         url: photoUrl
//       };
//     }) || [];

//     // Get sharing options from pricing
//     const sharingOptions = [];

//     if (hostel.pricing) {
//       if (hostel.pricing.single?.monthly?.price !== undefined && hostel.pricing.single?.monthly?.price !== null) {
//         sharingOptions.push({
//           type: '1 Sharing',
//           price: hostel.pricing.single.monthly.price,
//           available: hostel.pricing.single.availableBeds || 0
//         });
//       }
//       if (hostel.pricing.double?.monthly?.price !== undefined && hostel.pricing.double?.monthly?.price !== null) {
//         sharingOptions.push({
//           type: '2 Sharing',
//           price: hostel.pricing.double.monthly.price,
//           available: hostel.pricing.double.availableBeds || 0
//         });
//       }
//       if (hostel.pricing.triple?.monthly?.price !== undefined && hostel.pricing.triple?.monthly?.price !== null) {
//         sharingOptions.push({
//           type: '3 Sharing',
//           price: hostel.pricing.triple.monthly.price,
//           available: hostel.pricing.triple.availableBeds || 0
//         });
//       }
//       if (hostel.pricing.four?.monthly?.price !== undefined && hostel.pricing.four?.monthly?.price !== null) {
//         sharingOptions.push({
//           type: '4 Sharing',
//           price: hostel.pricing.four.monthly.price,
//           available: hostel.pricing.four.availableBeds || 0
//         });
//       }
//     }

//     const firstSharing = sharingOptions.find(opt => opt.available > 0) || sharingOptions[0];
//     const sharingNumber = firstSharing ? parseInt(firstSharing.type.split(' ')[0]) : 2;

//     // Calculate rating based on facilities and photos
//     const baseRating = 3.5;
//     let ratingBonus = 0;

//     if (allPhotos.length > 0) {
//       ratingBonus += 0.3;
//     }

//     const facilitiesCount = hostel.facilities?.essentials?.length || 0;
//     ratingBonus += Math.min(facilitiesCount * 0.1, 0.5);

//     if (hostel.facilities?.essentials?.includes('Air Conditioning')) {
//       ratingBonus += 0.2;
//     }
//     if (hostel.facilities?.essentials?.includes('Free WiFi')) {
//       ratingBonus += 0.2;
//     }

//     const finalRating = Math.min(baseRating + ratingBonus + (Math.random() * 0.6), 5.0);

//     return {
//       id: hostel._id,
//       name: hostel.hostelName || 'Unnamed Hostel',
//       address: hostel.address || 'Address not provided',
//       price: firstSharing ? `₹${firstSharing.price} / month` : `₹${hostel.startingPrice || 0} / month`,
//       location: extractLocationFromAddress(hostel.address),
//       rating: parseFloat(finalRating.toFixed(1)),
//       image: imageUrl,
//       facilities: hostel.facilities?.essentials || [],
//       gender: determineGenderFromHostel(hostel),
//       sharing: sharingNumber,
//       summary: hostel.summary || 'Comfortable accommodation with modern amenities.',
//       contact: hostel.contact || 'Not provided',
//       email: hostel.email || 'Not provided',
//       coordinates: hostel.coordinates || null,
//       allPhotos: allPhotos,
//       allFacilities: hostel.facilities || {},
//       pricing: hostel.pricing || {},
//       availabilitySummary: hostel.availabilitySummary || {},
//       sharingOptions: sharingOptions,
//       startingPrice: hostel.startingPrice || 0,
//       recommendationScore: calculateRecommendationScore(hostel, allPhotos.length),
//       hostelOwnerId: hostel._id
//     };
//   };

//   const calculateRecommendationScore = (hostel: Hostel, photoCount: number): number => {
//     let score = 0;

//     score += Math.min(photoCount * 4, 20);

//     const facilitiesCount = hostel.facilities?.essentials?.length || 0;
//     score += Math.min(facilitiesCount * 1.5, 15);

//     const premiumAmenities = ['Air Conditioning', 'Free WiFi', 'CCTV Security', 'Laundry Service'];
//     premiumAmenities.forEach(amenity => {
//       if (hostel.facilities?.essentials?.includes(amenity)) {
//         score += 3;
//       }
//     });

//     const totalAvailableBeds = Object.values(hostel.availabilitySummary || {}).reduce(
//       (sum: number, type: any) => sum + (type.availableBeds || 0), 0
//     );
//     score += Math.min(totalAvailableBeds * 2, 10);

//     const basePrice = hostel.startingPrice || 10000;
//     if (basePrice < 5000) score += 15;
//     else if (basePrice < 8000) score += 10;
//     else if (basePrice < 12000) score += 5;

//     return Math.round(score);
//   };

//   const getForYouHostels = (hostels: any[]) => {
//     return hostels
//       .sort((a, b) => b.recommendationScore - a.recommendationScore)
//       .slice(0, 6);
//   };

//   const getFeaturedHostels = (hostels: any[]) => {
//     return hostels
//       .sort((a, b) => b.rating - a.rating)
//       .slice(0, 6);
//   };

//   // Fetch hostels from API
//   const fetchHostels = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await ApiClient.get<HostelsResponse>('/student/hostels');

//       if (response.success) {
//         console.log("response from the api", response.data);

//         const transformedHostels = response.data.map(hostel => transformHostelData(hostel));

//         setAllHostels(transformedHostels);
//         setFilteredHostels(transformedHostels);
//         setHostelsToShow(transformedHostels);

//         // Set specialized lists
//         setForYouHostels(getForYouHostels(transformedHostels));
//         setFeaturedHostels(getFeaturedHostels(transformedHostels));
//       } else {
//         setError('Failed to fetch hostels');
//       }
//     } catch (err) {
//       console.error('Error fetching hostels:', err);
//       setError('Failed to load hostels. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load user data on focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchUserData();
//     }, [])
//   );

//   useEffect(() => {
//     // Request location permission & detect location
//     (async () => {
//       setLocationLoading(true);
//       try {
//         let { status } = await Location.requestForegroundPermissionsAsync();
//         setLocationPermStatus(status);
//         if (status !== "granted") {
//           setDetectedLocation("Location permission denied");
//           setLocationLoading(false);
//           return;
//         }
//         let loc = await Location.getCurrentPositionAsync({});
//         const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
//         if (addr && addr.length > 0) {
//           const city = addr[0].city || addr[0].subregion || addr[0].district;
//           setDetectedLocation(city || "Unknown location");
//         } else {
//           setDetectedLocation("Unknown location");
//         }
//       } catch (error) {
//         setDetectedLocation("Failed to detect location");
//       } finally {
//         setLocationLoading(false);
//       }
//     })();

//     // Fetch hostels on component mount
//     fetchHostels();
    
//     // Fetch user data on component mount
//     fetchUserData();
//   }, []);

//   useEffect(() => {
//     // Auto-scroll banners
//     const interval = setInterval(() => {
//       const nextIndex = (currentBannerIndex + 1) % banners.length;
//       setCurrentBannerIndex(nextIndex);
//       bannerScrollRef.current?.scrollToIndex({
//         index: nextIndex,
//         animated: true,
//       });
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [currentBannerIndex]);

//   useEffect(() => {
//     // Filter based on search and filters
//     let filtered = allHostels;
//     if (searchText.trim().length > 0) {
//       const lowerSearch = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (h) => h.name.toLowerCase().includes(lowerSearch) || h.location.toLowerCase().includes(lowerSearch)
//       );
//     }

//     if (selectedAmenities.length > 0)
//       filtered = filtered.filter((h) => selectedAmenities.every((a) => h.facilities.includes(a)));

//     if (selectedSharingTypes.length > 0) filtered = filtered.filter((h) => selectedSharingTypes.includes(h.sharing));

//     if (selectedGender) filtered = filtered.filter((h) => h.gender === selectedGender);

//     filtered = filtered.filter((h) => {
//       const priceNum = parseInt(h.price.replace(/[^0-9]/g, ""), 10) || 0;
//       return priceNum <= maxPrice;
//     });

//     setFilteredHostels(filtered);

//     // Update specialized lists
//     setForYouHostels(getForYouHostels(filtered));
//     setFeaturedHostels(getFeaturedHostels(filtered));
//   }, [searchText, selectedAmenities, selectedSharingTypes, selectedGender, maxPrice, allHostels]);

//   useEffect(() => {
//     // Update hostelsToShow depending on selectedLocationKey
//     if (selectedLocationKey === "nearby") {
//       if (
//         detectedLocation &&
//         !["Unknown location", "Location permission denied", "Failed to detect location"].includes(detectedLocation)
//       ) {
//         const filteredByLocation = filteredHostels.filter((h) =>
//           h.location.toLowerCase().includes(detectedLocation.toLowerCase())
//         );
//         setHostelsToShow(filteredByLocation.length > 0 ? filteredByLocation : filteredHostels);
//       } else {
//         setHostelsToShow(filteredHostels);
//       }
//     } else {
//       const locObj = locations.find((l) => l.key === selectedLocationKey);
//       if (!locObj) {
//         setHostelsToShow(filteredHostels);
//       } else {
//         const filteredByLocation = filteredHostels.filter(
//           (h) => h.location.toLowerCase() === locObj.label.toLowerCase()
//         );
//         setHostelsToShow(filteredByLocation);
//       }
//     }
//   }, [selectedLocationKey, filteredHostels, detectedLocation]);

//   const toggleAmenity = (item: string) => {
//     setSelectedAmenities(selectedAmenities.includes(item) ? selectedAmenities.filter((a) => a !== item) : [...selectedAmenities, item]);
//   };

//   const toggleSharingType = (sharing: number) => {
//     setSelectedSharingTypes(selectedSharingTypes.includes(sharing) ? selectedSharingTypes.filter((r) => r !== sharing) : [...selectedSharingTypes, sharing]);
//   };

//   const toggleGender = (gender: string) => {
//     setSelectedGender(selectedGender === gender ? "" : gender);
//   };

//   const applyFilters = () => {
//     const price = parseInt(priceInput, 10);
//     if (isNaN(price) || price <= 0) {
//       Alert.alert("Invalid price", "Please enter a valid maximum price.");
//       return;
//     }
//     setMaxPrice(price);
//     setFilterVisible(false);
//   };

//   const cancelFilters = () => {
//     setPriceInput(maxPrice.toString());
//     setFilterVisible(false);
//   };

//   // Function to clear all filters
//   const clearAllFilters = () => {
//     setSelectedAmenities([]);
//     setSelectedSharingTypes([]);
//     setSelectedGender("");
//     setMaxPrice(20000);
//     setPriceInput("20000");
//   };

//   // Function to remove specific filter
//   const removeFilter = (type: string, value?: any) => {
//     switch (type) {
//       case 'amenity':
//         setSelectedAmenities(selectedAmenities.filter(a => a !== value));
//         break;
//       case 'sharing':
//         setSelectedSharingTypes(selectedSharingTypes.filter(s => s !== value));
//         break;
//       case 'gender':
//         setSelectedGender("");
//         break;
//       case 'price':
//         setMaxPrice(20000);
//         setPriceInput("20000");
//         break;
//       case 'all':
//         clearAllFilters();
//         break;
//     }
//   };

//   const onShare = async () => {
//     try {
//       const message = `🚀 Discover the Best Hostel Experience with Fyndom! 🏠

// Join me on Fyndom - the ultimate platform for finding perfect hostels and PGs! 

// ✨ Why Choose Fyndom?
// • 5000+ Verified Hostels
// • Best Prices Guaranteed
// • Safety & Quality Assured
// • Easy Booking Process

// 🎁 Special Offer for You:
// Use my referral code "${referralCode}" during signup and get:
// ✅ ₹250 OFF on your first booking
// ✅ Priority customer support
// ✅ Exclusive member benefits

// 💰 I'll also earn ₹250 when you complete your first booking!

// 📱 Download Fyndom Now: https://fyndom.app/download

// 🔑 Referral Code: ${referralCode}

// Don't settle for less - find your perfect home away from home with Fyndom! 🏡💫`;

//       await Share.share({
//         message,
//         title: 'Join Fyndom - Get ₹250 OFF!'
//       });
//     } catch (error) {
//       Alert.alert("Error", "Failed to share the referral message");
//     }
//   };

//   const copyReferralCode = () => {
//     Alert.alert("Referral Code Copied!", `Code: ${referralCode}\n\nShare this code with your friends!`);
//   };

//   const handleBannerScroll = (event: any) => {
//     const contentOffset = event.nativeEvent.contentOffset;
//     const viewSize = event.nativeEvent.layoutMeasurement;
//     const pageNum = Math.floor(contentOffset.x / viewSize.width);
//     setCurrentBannerIndex(pageNum);
//   };

//   const renderBannerItem = ({ item, index }: { item: any; index: number }) => (
//     <View style={styles.bannerCard}>
//       <Image source={item.img} style={styles.bannerImg} />
//     </View>
//   );

//   const renderHostelCard = ({ item }: any) => (
//     <View style={styles.featuredCard}>
//       {item.image ? (
//         <Image source={{ uri: item.image }} style={styles.featuredImg} />
//       ) : (
//         <View style={styles.noImageContainer}>
//           <Ionicons name="home-outline" size={40} color="#ccc" />
//           <Text style={styles.noImageText}>No Image</Text>
//         </View>
//       )}
//       <View style={styles.featuredContent}>
//         <Text style={styles.featuredName}>{item.name}</Text>
//         <Text style={styles.featuredLoc}>
//           {item.location} • {item.price}
//         </Text>
//         <Text style={styles.featuredAddress} numberOfLines={1}>
//           {item.address || ""}
//         </Text>
//         <Text style={styles.featuredRating}>⭐ {item.rating.toFixed(1)}</Text>

//         {/* Display Available Beds */}
//         <View style={styles.availabilityRow}>
//           {item.pricing?.single?.availableBeds > 0 && (
//             <View style={styles.availabilityTag}>
//               <Text style={styles.availabilityText}>1: {item.pricing.single.availableBeds}</Text>
//             </View>
//           )}
//           {item.pricing?.double?.availableBeds > 0 && (
//             <View style={styles.availabilityTag}>
//               <Text style={styles.availabilityText}>2: {item.pricing.double.availableBeds}</Text>
//             </View>
//           )}
//           {item.pricing?.triple?.availableBeds > 0 && (
//             <View style={styles.availabilityTag}>
//               <Text style={styles.availabilityText}>3: {item.pricing.triple.availableBeds}</Text>
//             </View>
//           )}
//           {item.pricing?.four?.availableBeds > 0 && (
//             <View style={styles.availabilityTag}>
//               <Text style={styles.availabilityText}>4: {item.pricing.four.availableBeds}</Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.facilitiesRow}>
//           {item.facilities.slice(0, 3).map((f: string, i: number) => (
//             <View key={i} style={styles.facilityTag}>
//               <Text style={styles.facilityText}>{f}</Text>
//             </View>
//           ))}
//           {item.facilities.length > 3 && (
//             <View style={styles.facilityTag}>
//               <Text style={styles.facilityText}>+{item.facilities.length - 3}</Text>
//             </View>
//           )}
//         </View>
//         <TouchableOpacity
//   style={styles.featuredBtn}
//   onPress={() =>
//     router.push({
//       pathname: "/HostelDetails",
//       params: {
//         hostel: JSON.stringify({
//           id: item.id,
//           hostelOwnerId: item.hostelOwnerId || item.id,
//           name: item.name,
//           address: item.address,
//           contact: item.contact,
//           email: item.email,
//           hostelType: item.hostelType || '',      // if you have it on item
//           rating: item.rating,
//           summary: item.summary,
//           photos: item.allPhotos || item.photos,  // matches HostelData.photos [file:3]
//           pricing: item.pricing || {},            // used for fallback pricing [file:3]
//           allFacilities: item.allFacilities || {
//             roomSharingTypes: [],
//             bathroomTypes: [],
//             essentials: [],
//             foodServices: [],
//           },
//           coordinates: item.coordinates || { latitude: 0, longitude: 0 },
//           startingPrice: item.startingPrice || 0,
//           availabilitySummary: item.availabilitySummary || {},
//           sharingOptions: item.sharingOptions || [],
//           allPhotos: item.allPhotos || item.photos || [],
//         }),
//       },
//     })
//   }
// >
//   <Text style={styles.featuredBtnText}>View Details</Text>
// </TouchableOpacity>

//       </View>
//     </View>
//   );

//   const renderOfferCard = ({ item }: any) => (
//     <View style={styles.offerRectCard}>
//       <Image source={item.icon} style={styles.offerRectIcon} resizeMode="contain" />
//       <Text style={styles.offerRectTitle}>{item.title}</Text>
//     </View>
//   );

//   const renderReferCard = ({ item }: any) => (
//     <ImageBackground source={item.bgImage} style={styles.referCardBg} imageStyle={styles.referCardImageStyle}>
//       <View style={styles.referOverlay} />
//       <View style={styles.referIconContainer}>
//         <Ionicons name={item.icon as any} size={36} color="#FFD600" />
//       </View>
//       <View style={styles.referTextContainer}>
//         <Text style={styles.referTitle}>{item.title}</Text>
//         <Text style={styles.referDesc}>{item.desc}</Text>
//       </View>
//     </ImageBackground>
//   );

//   const handleSeeAll = (section?: string) => {
//     let hostelsToSend = [];
//     let title = 'All Hostels';
//     let sectionType = 'all';

//     if (section === 'forYou') {
//       hostelsToSend = forYouHostels;
//       title = 'Recommended For You';
//       sectionType = 'forYou';
//     } else if (section === 'featured') {
//       hostelsToSend = featuredHostels;
//       title = 'Featured Hostels';
//       sectionType = 'featured';
//     } else {
//       hostelsToSend = hostelsToShow;
//     }

//     router.push({
//       pathname: "/AllHostels",
//       params: {
//         hostels: JSON.stringify(hostelsToSend),
//         title: title,
//         sectionType: sectionType
//       }
//     });
//   };

//   const renderLocationItem = ({ item }: any) => (
//     <TouchableOpacity
//       style={[styles.locationItem, selectedLocationKey === item.key && styles.locationItemSelected]}
//       onPress={() => setSelectedLocationKey(item.key)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.locationCircle}>
//         <Image source={item.icon} style={styles.locationIcon} resizeMode="cover" />
//       </View>
//       <Text style={styles.locationLabel}>{item.label}</Text>
//     </TouchableOpacity>
//   );

//   const onSearchPress = () => {
//     if (searchText.trim().length > 0) {
//       router.push({
//         pathname: "/Search",
//         params: { query: searchText.trim() }
//       });
//       Keyboard.dismiss();
//     } else {
//       Alert.alert("Please enter search text");
//     }
//   };

//   const boysHostels = hostelsToShow.filter((h) => h.gender === "Boys");
//   const girlsHostels = hostelsToShow.filter((h) => h.gender === "Girls");

//   // Banner pagination dots
//   const renderPaginationDots = () => (
//     <View style={styles.paginationContainer}>
//       {banners.map((_, index) => (
//         <View
//           key={index}
//           style={[
//             styles.paginationDot,
//             currentBannerIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
//           ]}
//         />
//       ))}
//     </View>
//   );

//   // Render filter chips
//   const renderFilterChips = () => {
//     if (!hasActiveFilters) return null;

//     return (
//       <View style={styles.filterChipsContainer}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.filterChipsContent}
//         >
//           {/* Price Filter Chip */}
//           {maxPrice < 20000 && (
//             <View style={styles.filterChip}>
//               <Text style={styles.filterChipText}>Price: Up to ₹{maxPrice}</Text>
//               <TouchableOpacity
//                 onPress={() => removeFilter('price')}
//                 style={styles.filterChipClose}
//               >
//                 <Ionicons name="close" size={16} color="#219150" />
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Gender Filter Chip */}
//           {selectedGender && (
//             <View style={styles.filterChip}>
//               <Text style={styles.filterChipText}>Gender: {selectedGender}</Text>
//               <TouchableOpacity
//                 onPress={() => removeFilter('gender')}
//                 style={styles.filterChipClose}
//               >
//                 <Ionicons name="close" size={16} color="#219150" />
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Sharing Type Filter Chips */}
//           {selectedSharingTypes.map((sharing) => (
//             <View key={`sharing-${sharing}`} style={styles.filterChip}>
//               <Text style={styles.filterChipText}>{sharing} Sharing</Text>
//               <TouchableOpacity
//                 onPress={() => removeFilter('sharing', sharing)}
//                 style={styles.filterChipClose}
//               >
//                 <Ionicons name="close" size={16} color="#219150" />
//               </TouchableOpacity>
//             </View>
//           ))}

//           {/* Amenities Filter Chips */}
//           {selectedAmenities.map((amenity) => (
//             <View key={`amenity-${amenity}`} style={styles.filterChip}>
//               <Text style={styles.filterChipText}>{amenity}</Text>
//               <TouchableOpacity
//                 onPress={() => removeFilter('amenity', amenity)}
//                 style={styles.filterChipClose}
//               >
//                 <Ionicons name="close" size={16} color="#219150" />
//               </TouchableOpacity>
//             </View>
//           ))}

//           {/* Clear All Button */}
//           <TouchableOpacity
//             style={styles.clearAllButton}
//             onPress={() => removeFilter('all')}
//           >
//             <Text style={styles.clearAllText}>Clear All</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </View>
//     );
//   };

//   // Combined loading state for hostels and user data
//   const isLoading = loading || userLoading;

//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.pageBg}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#219150" />
//           <Text style={styles.loadingText}>Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error && allHostels.length === 0) {
//     return (
//       <SafeAreaView style={styles.pageBg}>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity style={styles.retryButton} onPress={fetchHostels}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.pageBg} edges={[]}>
//       <StatusBar hidden />
//       <ScrollView contentContainerStyle={{ ...styles.scrollAll, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
//         {/* Updated Header Card - No rounded corners and extends up */}
//         <View style={styles.headerCard}>
//           <View style={styles.cardRow}>
//             <Image source={require("../../assets/logo.png")} style={styles.logoLarge} />
//             <View style={styles.headerRightActions}>
//               <TouchableOpacity onPress={() => router.push("/Notifications")} style={styles.iconButton}>
//                 <Ionicons name="notifications-outline" size={27} color="#222831" style={{ marginRight: 8 }} />
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 onPress={async () => {
//                   // Refresh user data before navigating to profile
//                   await fetchUserData();
//                   router.push("/Profile");
//                 }} 
//                 style={styles.iconButton}
//               >
//                 <Ionicons name="person-circle-outline" size={27} color="#222831" />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View style={styles.locationRow}>
//             <Ionicons name="location-outline" size={18} color="#000" />
//             <Text style={styles.locationDetectText}>{locationLoading ? "Detecting location..." : detectedLocation}</Text>
//           </View>
//           <Text style={styles.welcomeText}>
//             {timeGreeting},{"\n"}
//             {userName}
//           </Text>
//           <View style={styles.searchWrap}>
//             <Ionicons name="search-outline" size={20} color="#555" />
//             <TextInput
//               value={searchText}
//               onChangeText={setSearchText}
//               placeholder="Search hostels, areas..."
//               placeholderTextColor="#aaa"
//               style={styles.searchInputSmall}
//               returnKeyType="search"
//               onSubmitEditing={onSearchPress}
//             />
//             <TouchableOpacity onPress={onSearchPress} style={{ paddingHorizontal: 6 }}>
//               <Ionicons name="arrow-forward-circle-outline" size={24} color="#219150" />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => setFilterVisible(true)}>
//               <Ionicons
//                 name="options-outline"
//                 size={20}
//                 color={hasActiveFilters ? "#219150" : "#555"}
//                 style={{ marginLeft: 8 }}
//               />
//             </TouchableOpacity>
//           </View>

//           {/* Filter Chips Section */}
//           {renderFilterChips()}
//         </View>

//         <View style={styles.locationsContainer}>
//           <FlatList data={locations} renderItem={renderLocationItem} keyExtractor={(item) => item.key} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }} />
//         </View>

//         {/* Updated Banner Section */}
//         <View style={styles.bannerSection}>
//           <FlatList
//             ref={bannerScrollRef}
//             data={banners}
//             renderItem={renderBannerItem}
//             keyExtractor={(_, index) => `banner-${index}`}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             onScroll={handleBannerScroll}
//             scrollEventThrottle={16}
//             getItemLayout={(_, index) => ({
//               length: width,
//               offset: width * index,
//               index,
//             })}
//           />
//           {renderPaginationDots()}
//         </View>

//         {/* For You Section */}
//         <View style={styles.sectionRow}>
//           <Text style={styles.sectionTitle}>For You</Text>
//           <TouchableOpacity onPress={() => handleSeeAll('forYou')}>
//             <Text style={styles.seeAllBtn}>See All ▸</Text>
//           </TouchableOpacity>
//         </View>
//         {forYouHostels.length > 0 ? (
//           <FlatList
//             data={forYouHostels}
//             renderItem={renderHostelCard}
//             keyExtractor={(item) => "foryou-" + item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.flatListRow}
//           />
//         ) : (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyStateText}>No hostels match your preferences</Text>
//             <TouchableOpacity
//               style={styles.clearFiltersButton}
//               onPress={clearAllFilters}
//             >
//               <Text style={styles.clearFiltersText}>Clear Filters</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Featured Hostels Section */}
//         <View style={styles.sectionRow}>
//           <Text style={styles.sectionTitle}>Featured Hostels</Text>
//           <TouchableOpacity onPress={() => handleSeeAll('featured')}>
//             <Text style={styles.seeAllBtn}>See All ▸</Text>
//           </TouchableOpacity>
//         </View>
//         {featuredHostels.length > 0 ? (
//           <FlatList
//             data={featuredHostels}
//             renderItem={renderHostelCard}
//             keyExtractor={(item) => "featured-" + item.id}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             style={styles.flatListRow}
//           />
//         ) : (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyStateText}>No featured hostels available</Text>
//           </View>
//         )}

//         <View style={styles.sectionRow}>
//           <Text style={styles.sectionTitle}>Offers for You</Text>
//           <TouchableOpacity onPress={handleSeeAll}>
//             <Text style={styles.seeAllBtn}>See All ▸</Text>
//           </TouchableOpacity>
//         </View>
//         <FlatList data={offers} renderItem={renderOfferCard} keyExtractor={(_, i) => "offer" + i} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 12, paddingVertical: 14 }} />

//         <Text style={styles.sectionTitle}>Refer & Win</Text>
//         <FlatList data={referCards} renderItem={renderReferCard} keyExtractor={(_, i) => "refer" + i} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} contentContainerStyle={{ paddingLeft: 12, paddingVertical: 14 }} />

//         {/* Enhanced About Refer and Earn Section */}
//         <View style={styles.aboutReferContainer}>
//           <Text style={styles.aboutReferTitle}>About Refer and Earn Program</Text>

//           <View style={styles.referralStatsContainer}>
//             <View style={styles.statItem}>
//               <Text style={styles.statValue}>₹{referralStats.totalEarned}</Text>
//               <Text style={styles.statLabel}>Total Earned</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statValue}>{referralStats.successfulReferrals}</Text>
//               <Text style={styles.statLabel}>Successful</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statValue}>{referralStats.pendingReferrals}</Text>
//               <Text style={styles.statLabel}>Pending</Text>
//             </View>
//           </View>

//           <Text style={styles.aboutReferSubTitle}>How It Works:</Text>
//           <View style={styles.stepsContainer}>
//             <View style={styles.stepItem}>
//               <View style={styles.stepNumber}>
//                 <Text style={styles.stepNumberText}>1</Text>
//               </View>
//               <Text style={styles.stepText}>Share your referral code with friends</Text>
//             </View>
//             <View style={styles.stepItem}>
//               <View style={styles.stepNumber}>
//                 <Text style={styles.stepNumberText}>2</Text>
//               </View>
//               <Text style={styles.stepText}>Your friend signs up using your code</Text>
//             </View>
//             <View style={styles.stepItem}>
//               <View style={styles.stepNumber}>
//                 <Text style={styles.stepNumberText}>3</Text>
//               </View>
//               <Text style={styles.stepText}>They complete their first booking</Text>
//             </View>
//             <View style={styles.stepItem}>
//               <View style={styles.stepNumber}>
//                 <Text style={styles.stepNumberText}>4</Text>
//               </View>
//               <Text style={styles.stepText}>You get ₹250 credited to your Fyndom account</Text>
//             </View>
//           </View>

//           <View style={styles.referralCodeContainer}>
//             <Text style={styles.referralCodeLabel}>Your Referral Code:</Text>
//             <TouchableOpacity style={styles.referralCodeBox} onPress={copyReferralCode}>
//               <Text style={styles.referralCodeText}>{referralCode}</Text>
//               <Ionicons name="copy-outline" size={20} color="#219150" />
//             </TouchableOpacity>
//           </View>

//           <Text style={styles.aboutReferText}>
//             Invite your friends to Fyndom and earn exciting rewards every time they complete their first booking.
//             Your friends will also get ₹250 OFF on their first booking when they use your referral code.
//             It's a win-win for everyone! Share your referral code via WhatsApp, Instagram, or any other platform and start earning today.
//           </Text>

//           <Text style={styles.termsText}>
//             * Terms: Reward is credited only after your friend completes their first booking. Maximum earnings capped at ₹5000 per month.
//           </Text>

//           <TouchableOpacity style={styles.shareButton} onPress={onShare}>
//             <Ionicons name="share-social-outline" size={20} color="#fff" />
//             <Text style={styles.shareButtonText}>Share Referral</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Boys Hostels Section */}
//         <Text style={styles.sectionTitle}>Boys Hostels</Text>
//         {boysHostels.length > 0 ? (
//           <FlatList data={boysHostels} renderItem={renderHostelCard} keyExtractor={(item) => "boy-" + item.id} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} />
//         ) : (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyStateText}>No boys hostels available</Text>
//           </View>
//         )}

//         {/* Girls Hostels Section */}
//         <Text style={styles.sectionTitle}>Girls Hostels</Text>
//         {girlsHostels.length > 0 ? (
//           <FlatList data={girlsHostels} renderItem={renderHostelCard} keyExtractor={(item) => "girl-" + item.id} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} />
//         ) : (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyStateText}>No girls hostels available</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Filter Modal */}
//       <Modal visible={filterVisible} animationType="slide" transparent>
//         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
//           <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
//             <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
//           </TouchableWithoutFeedback>
//           <View style={styles.filterModalContent}>
//             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
//               <Text style={styles.filterModalTitle}>Filters</Text>
//               <Text style={styles.filterSectionTitle}>Amenities</Text>
//               <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//                 {amenitiesOptions.map((item, idx) => (
//                   <TouchableOpacity
//                     key={idx}
//                     style={{ flexDirection: "row", alignItems: "center", width: "50%", marginVertical: 6 }}
//                     onPress={() => toggleAmenity(item)}
//                   >
//                     <View
//                       style={[
//                         styles.checkbox,
//                         {
//                           borderColor: selectedAmenities.includes(item) ? "#ffffffff" : "#9e9e9e",
//                           backgroundColor: selectedAmenities.includes(item) ? "#ffffffff" : "transparent",
//                         },
//                       ]}
//                     >
//                       {selectedAmenities.includes(item) && <View style={styles.checkboxInner} />}
//                     </View>
//                     <Text style={styles.filterOptionText}>{item}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <Text style={styles.filterSectionTitle}>Max Price</Text>
//               <TextInput
//                 value={priceInput}
//                 onChangeText={(val) => setPriceInput(val.replace(/\D/g, ""))}
//                 placeholder="Max Price"
//                 keyboardType="numeric"
//                 style={styles.priceInput}
//                 maxLength={6}
//               />
//               <Text style={styles.filterSectionTitle}>Sharing</Text>
//               <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//                 {sharingOptions.map((sharing) => (
//                   <TouchableOpacity
//                     key={sharing}
//                     style={{ flexDirection: "row", alignItems: "center", width: "33%", marginVertical: 6 }}
//                     onPress={() => toggleSharingType(sharing)}
//                   >
//                     <View
//                       style={[
//                         styles.checkbox,
//                         {
//                           borderColor: selectedSharingTypes.includes(sharing) ? "#f2f2f2ff" : "#9e9e9e",
//                           backgroundColor: selectedSharingTypes.includes(sharing) ? "#ffffffff" : "transparent",
//                         },
//                       ]}
//                     >
//                       {selectedSharingTypes.includes(sharing) && <View style={styles.checkboxInner} />}
//                     </View>
//                     <Text style={styles.filterOptionText}>{sharing} Sharing</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <Text style={styles.filterSectionTitle}>Gender</Text>
//               <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
//                 {genderOptions.map((gender, i) => (
//                   <TouchableOpacity key={i} style={{ flexDirection: "row", alignItems: "center", width: "33%", marginVertical: 6 }} onPress={() => toggleGender(gender)}>
//                     <View
//                       style={[
//                         styles.checkbox,
//                         {
//                           borderColor: selectedGender === gender ? "#fcfcfcff" : "#9e9e9e",
//                           backgroundColor: selectedGender === gender ? "#fffefeff" : "transparent",
//                         },
//                       ]}
//                     >
//                       {selectedGender === gender && <View style={styles.checkboxInner} />}
//                     </View>
//                     <Text style={styles.filterOptionText}>{gender}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
//                 <TouchableOpacity style={styles.cancelBtn} onPress={cancelFilters}>
//                   <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
//                   <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   pageBg: { flex: 1, backgroundColor: "#fff", paddingTop: 0 },
//   scrollAll: { paddingBottom: 22 },
//   bannerSection: {
//     marginVertical: 10,
//     position: 'relative',
//   },
//   bannerCard: {
//     width: width - 24,
//     height: 200,
//     borderRadius: 14,
//     overflow: "hidden",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     marginHorizontal: 12,
//   },
//   bannerImg: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "cover",
//     borderRadius: 14,
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
//   paginationDotActive: {
//     backgroundColor: '#219150',
//     width: 20,
//   },
//   paginationDotInactive: {
//     backgroundColor: '#ccc',
//   },
//   // Updated Header Card styles - no rounded corners
//   headerCard: {
//     backgroundColor: "#fdfde7ff",
//     elevation: 3,
//     shadowColor: "#222831",
//     shadowRadius: 7,
//     shadowOpacity: 0.09,
//     shadowOffset: { width: 0, height: 2 },
//     marginHorizontal: 0,
//     paddingHorizontal: 12,
//     paddingBottom: 15,
//     paddingTop: 10,
//     minHeight: 64,
//     justifyContent: "flex-start",
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//     borderTopLeftRadius: 0,
//     borderTopRightRadius: 0,
//   },
//   cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0, marginTop: 0 },
//   logoLarge: {
//     width: 130,
//     height: 110,
//     resizeMode: "contain",
//     marginLeft: 4,
//     marginTop: -6,
//   },
//   headerRightActions: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginTop: 0,
//     paddingRight: 4
//   },
//   iconButton: {
//     paddingTop: 0,
//     height: 55,
//     marginTop: -6,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 4,
//     marginBottom: 8,
//     marginTop: -15,
//   },
//   locationDetectText: { fontSize: 16, fontWeight: "normal", color: "#000000", marginLeft: 6 },
//   welcomeText: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#219150",
//     marginBottom: 6,
//     marginTop: 0,
//     textAlign: "left",
//     letterSpacing: 1,
//     marginLeft: 4,
//   },
//   searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffffff", borderRadius: 14, paddingHorizontal: 10, height: 40, marginTop: 6 },
//   searchInputSmall: { flex: 1, marginLeft: 8, fontSize: 16, color: "#222831", height: 38 },
//   sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginHorizontal: 12 },
//   sectionTitle: { fontWeight: "bold", fontSize: 18, color: "#222831", marginVertical: 8, marginLeft: 12 },
//   seeAllBtn: { fontSize: 13, color: "#219150", fontWeight: "700", paddingHorizontal: 6 },
//   flatListRow: { marginVertical: 7, minHeight: 110, paddingLeft: 10 },
//   featuredCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     width: width * 0.6,
//     marginRight: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     shadowColor: "#222",
//     shadowOpacity: 0.06,
//     elevation: 3,
//     padding: 10,
//   },
//   featuredImg: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
//   featuredContent: { flex: 1, justifyContent: "space-between" },
//   featuredName: { fontWeight: "bold", fontSize: 14, color: "#222831" },
//   featuredLoc: { fontSize: 12, color: "#3a6351", marginVertical: 3 },
//   featuredAddress: { fontSize: 11, color: "#636363", marginBottom: 2, fontWeight: "600", width: "100%" },
//   featuredRating: { fontSize: 12, color: "#ff7b54", marginVertical: 2 },
//   facilitiesRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
//   facilityTag: { backgroundColor: "#c7e47e", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginTop: 6 },
//   facilityText: { color: "#155a46", fontWeight: "700", fontSize: 12 },
//   featuredBtn: { backgroundColor: "#219150", borderRadius: 8, marginTop: 6, paddingVertical: 6, alignItems: "center" },
//   featuredBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
//   offerRectCard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     width: width * 0.8,
//     height: 110,
//     marginRight: 20,
//     alignItems: "center",
//     paddingHorizontal: 24,
//     borderWidth: 1,
//     borderColor: "#e9e9e9",
//     shadowColor: "#000",
//     shadowOpacity: 0.15,
//     shadowOffset: { width: 0, height: 3 },
//     shadowRadius: 6,
//     elevation: 6,
//   },
//   offerRectIcon: { width: 80, height: 80, borderRadius: 14, marginRight: 28 },
//   offerRectTitle: { fontWeight: "bold", fontSize: 16, color: "#000000", flexShrink: 1 },
//   referCardBg: {
//     width: width * 0.8,
//     height: 170,
//     borderRadius: 18,
//     marginRight: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 28,
//     overflow: "hidden",
//     justifyContent: "flex-start",
//   },
//   referCardImageStyle: { borderRadius: 18, resizeMode: "cover" },
//   referOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 18,
//   },
//   referIconContainer: { marginRight: 20, zIndex: 10 },
//   referTextContainer: { flex: 1, zIndex: 10 },
//   referTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
//   referDesc: { fontSize: 16, color: "#f3f3f3", marginTop: 6 },
//   // Enhanced About Refer Section Styles
//   aboutReferContainer: {
//     marginHorizontal: 20,
//     marginVertical: 30,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   aboutReferTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#222831",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   aboutReferSubTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#219150",
//     marginTop: 16,
//     marginBottom: 12,
//   },
//   referralStatsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   statItem: {
//     alignItems: "center",
//     flex: 1,
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#219150",
//   },
//   statLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 4,
//   },
//   stepsContainer: {
//     marginBottom: 16,
//   },
//   stepItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   stepNumber: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: "#219150",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   stepNumberText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 12,
//   },
//   stepText: {
//     flex: 1,
//     fontSize: 14,
//     color: "#444",
//     lineHeight: 20,
//   },
//   referralCodeContainer: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   referralCodeLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#222831",
//     marginBottom: 8,
//   },
//   referralCodeBox: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#f1f8e9",
//     borderWidth: 2,
//     borderColor: "#219150",
//     borderRadius: 8,
//     padding: 12,
//   },
//   referralCodeText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#219150",
//     letterSpacing: 2,
//   },
//   aboutReferText: {
//     fontSize: 15,
//     color: "#444",
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   termsText: {
//     fontSize: 12,
//     color: "#666",
//     fontStyle: "italic",
//     marginBottom: 16,
//     lineHeight: 16,
//   },
//   shareButton: {
//     flexDirection: "row",
//     backgroundColor: "#219150",
//     paddingVertical: 14,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 4,
//   },
//   shareButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     marginLeft: 10,
//   },
//   filterModalContent: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     maxHeight: height * 0.75,
//     minHeight: height * 0.4,
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 18,
//     borderTopRightRadius: 18,
//     paddingVertical: 14,
//     paddingHorizontal: 18,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   filterModalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14, color: "#25c405ff" },
//   filterSectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8, color: "#04a00cff" },
//   cancelBtn: { flex: 1, backgroundColor: "#a1a1aa", paddingVertical: 7, borderRadius: 9, alignItems: "center", marginRight: 8 },
//   applyBtn: { flex: 1, backgroundColor: "#5a5c09ff", paddingVertical: 7, borderRadius: 9, alignItems: "center", marginLeft: 8 },
//   checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 10 },
//   checkboxInner: { width: 12, height: 12, backgroundColor: "#19a007ff", borderRadius: 3 },
//   filterOptionText: { fontSize: 13, color: "#d7ce27ff" },
//   priceInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14, fontSize: 13, width: "100%" },
//   locationsContainer: { marginTop: 12, paddingLeft: 12, paddingBottom: 6 },
//   locationItem: { alignItems: "center", marginRight: 16 },
//   locationCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#feffffff", justifyContent: "center", alignItems: "center", marginBottom: 6, overflow: "hidden" },
//   locationIcon: { width: "100%", height: "100%", borderRadius: 28 },
//   locationLabel: { fontSize: 12, color: "#0e0f0fff", fontWeight: "600", textAlign: "center", width: 70 },
//   locationItemSelected: {
//     borderWidth: 2,
//     borderColor: "#fdfdfdff",
//     borderRadius: 30,
//     padding: 2,
//   },
//   // Filter Chips Styles
//   filterChipsContainer: {
//     marginTop: 10,
//     paddingHorizontal: 4,
//   },
//   filterChipsContent: {
//     paddingHorizontal: 4,
//     alignItems: 'center',
//   },
//   filterChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f1f8e9',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: '#219150',
//   },
//   filterChipText: {
//     fontSize: 12,
//     color: '#219150',
//     fontWeight: '600',
//     marginRight: 4,
//   },
//   filterChipClose: {
//     padding: 2,
//   },
//   clearAllButton: {
//     backgroundColor: '#ff6b6b',
//     borderRadius: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginLeft: 4,
//   },
//   clearAllText: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: '600',
//   },
//   // Loading and Error States
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#219150',
//     marginTop: 10,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#ff6b6b',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#219150',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyState: {
//     padding: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginHorizontal: 12,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     marginVertical: 10,
//   },
//   emptyStateText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   clearFiltersButton: {
//     backgroundColor: '#219150',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   clearFiltersText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   availabilityRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 6,
//   },
//   availabilityTag: {
//     backgroundColor: '#e3f2fd',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginRight: 6,
//     marginBottom: 4,
//   },
//   availabilityText: {
//     fontSize: 10,
//     color: '#1976d2',
//     fontWeight: '600',
//   },
//   noImageContainer: {
//     width: '100%',
//     height: 120,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   noImageText: {
//     marginTop: 8,
//     fontSize: 12,
//     color: '#999',
//     fontWeight: '500',
//   },
// });


import { useThemeContext } from "@/components/ui/ThemeContext";
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  FlatList,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ImageSourcePropType,
  ImageBackground,
  Share,
  Alert,
  Keyboard,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import ApiClient from '../../app/api/ApiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get("window");

const nearbyIcon = require("../../assets/icons/nearby.png");
const kukatpallyIcon = require("../../assets/icons/kukatpally.png");
const lbNagarIcon = require("../../assets/icons/dilsukhnagar.png");
const secunderabadIcon = require("../../assets/icons/secunderabad.png");
const ameerpetIcon = require("../../assets/icons/ameerpet.png");
const hitechCityIcon = require("../../assets/icons/hitech_city.png");
const madhapurIcon = require("../../assets/icons/madhapur.jpg");
const begumpetIcon = require("../../assets/icons/begumpet.jpg");

const referralBackgrounds = [
  require("../../assets/images/referral_card_bg1.jpg"),
  require("../../assets/images/referral_card_bg2.jpg"),
  require("../../assets/images/referral_card_bg3.jpg"),
];

type LocationType = {
  key: string;
  label: string;
  shortLabel?: string;
  icon: ImageSourcePropType;
};

// Updated locations with shorter names
const locations: LocationType[] = [
  { key: "nearby", label: "Nearby", shortLabel: "Nearby", icon: nearbyIcon },
  { key: "kukatpally", label: "Kukatpally", shortLabel: "Kukatpally", icon: kukatpallyIcon },
  { key: "lb_nagar", label: "Dilsukhnagar", shortLabel: "Dilshuknagar", icon: lbNagarIcon },
  { key: "secunderabad", label: "Secunderabad", shortLabel: "Sec'bad", icon: secunderabadIcon },
  { key: "ameerpet", label: "Ameerpet", shortLabel: "Ameerpet", icon: ameerpetIcon },
  { key: "hitech_city", label: "Hitech City", shortLabel: "Hitech City", icon: hitechCityIcon },
  { key: "madhapur", label: "Madhapur", shortLabel: "Madhapur", icon: madhapurIcon },
  { key: "begumpet", label: "Begumpet", shortLabel: "Begumpet", icon: begumpetIcon },
];

const banners = [
  { img: require("../../assets/banner1.jpg") },
  { img: require("../../assets/banner2.jpg") },
  { img: require("../../assets/banner3.jpg") },
  { img: require("../../assets/banner4.jpg") },
];

const offers = [
  { title: "50% Off on First Booking", icon: require("../../assets/icons/first-booking.jpg") },
  { title: "Book 3 Get 1 Free", icon: require("../../assets/icons/discount.jpg") },
  { title: "Refer and Win ₹250", icon: require("../../assets/icons/referrals.jpg") },
  { title: "Festive Offer", icon: require("../../assets/icons/festive.png") },
];

const referCards = [
  {
    title: "Earn ₹250 for each referral",
    desc: "Invite your friends and earn",
    icon: "gift",
    bgImage: referralBackgrounds[0],
  },
  {
    title: "Unlock exclusive rewards",
    desc: "As your friends sign up",
    icon: "key",
    bgImage: referralBackgrounds[1],
  },
  {
    title: "Track referral status easily",
    desc: "All in one place",
    icon: "checkmark-circle",
    bgImage: referralBackgrounds[2],
  },
];

const amenitiesOptions = ["AC", "Wi-Fi", "Parking", "Verified Hostels", "Washing Machine", "Drinking Water"];
const sharingOptions = [1, 2, 3, 4, 5];
const genderOptions = ["Boys", "Girls", "Co-living"];

// Interface for API response
interface Hostel {
  _id: string;
  hostelName: string;
  address: string;
  contact: string;
  email: string;
  hostelType?: string;
  photos: Array<{
    filename: string;
    originalName: string;
    path: string;
    url: string;
    isPrimary: boolean;
    _id: string;
    uploadDate: string;
  }>;
  summary: string;
  startingPrice: number;
  pricing: {
    single: {
      daily: { price: number; currency: string } | null;
      monthly: { price: number; currency: string } | null;
      availableBeds: number;
    };
    double: {
      daily: { price: number; currency: string } | null;
      monthly: { price: number; currency: string } | null;
      availableBeds: number;
    };
    triple: {
      daily: { price: number; currency: string } | null;
      monthly: { price: number; currency: string } | null;
      availableBeds: number;
    };
    four: {
      daily: { price: number; currency: string } | null;
      monthly: { price: number; currency: string } | null;
      availableBeds: number;
    };
  };
  facilities: {
    roomSharingTypes: Array<{ roomType: string; sharingType: string; _id: string }>;
    bathroomTypes: string[];
    essentials: string[];
    foodServices: string[];
  };
  coordinates: {
    latitude?: number;
    longitude?: number;
  } | null;
  availabilitySummary: {
    single: { availableBeds: number; totalBeds: number };
    double: { availableBeds: number; totalBeds: number };
    triple: { availableBeds: number; totalBeds: number };
    four: { availableBeds: number; totalBeds: number };
  };
}

interface HostelsResponse {
  success: boolean;
  data: Hostel[];
  message: string;
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export default function Home() {
  const { isDark } = useThemeContext();
  const router = useRouter();

  const [locationPermStatus, setLocationPermStatus] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>("");

  const [searchText, setSearchText] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedSharingTypes, setSelectedSharingTypes] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [priceInput, setPriceInput] = useState(maxPrice.toString());
  const [selectedGender, setSelectedGender] = useState<string>("");

  const [selectedLocationKey, setSelectedLocationKey] = useState<string>("nearby");

  // Hostel states
  const [allHostels, setAllHostels] = useState<any[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<any[]>([]);
  const [hostelsToShow, setHostelsToShow] = useState<any[]>([]);
  const [forYouHostels, setForYouHostels] = useState<any[]>([]);
  const [featuredHostels, setFeaturedHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User states
  const [userName, setUserName] = useState<string>("Guest");
  const [timeGreeting, setTimeGreeting] = useState<string>("Welcome Back");
  const [userLoading, setUserLoading] = useState(true);

  // Referral state
  const [referralCode] = useState("FYNDOM250");
  const [referralStats] = useState({
    totalEarned: 1250,
    successfulReferrals: 5,
    pendingReferrals: 2
  });

  // Banner state and refs
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<FlatList>(null);
  const bannerPosition = useRef(new Animated.Value(0)).current;

  // Check if any filters are active
  const hasActiveFilters = selectedAmenities.length > 0 ||
    selectedSharingTypes.length > 0 ||
    selectedGender !== "" ||
    maxPrice < 20000 ||
    selectedLocationKey !== "nearby";

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Function to fetch user data from AsyncStorage
  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      
      // Try to get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        if (userData && userData.user && userData.user.fullName) {
          // Extract first name from full name
          const nameParts = userData.user.fullName.split(' ');
          setUserName(nameParts[0] || userData.user.fullName);
        } else if (userData && userData.user && userData.user.email) {
          // Use email username as fallback
          setUserName(userData.user.email.split('@')[0]);
        } else {
          setUserName("Guest");
        }
      } else {
        // Check for access token to see if user is logged in
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          // User is logged in but no name found
          setUserName("User");
        } else {
          setUserName("Guest");
        }
      }
      
      // Set time-based greeting
      setTimeGreeting(getTimeBasedGreeting());
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserName("Guest");
    } finally {
      setUserLoading(false);
    }
  };

  // Function to fetch user profile from API (optional)
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const response = await ApiClient.get('/students/profile');
      if (response.success && response.data) {
        const userData = response.data;
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          user: userData,
          role: 'student'
        }));
        
        // Update state
        if (userData.fullName) {
          const nameParts = userData.fullName.split(' ');
          setUserName(nameParts[0] || userData.fullName);
        } else if (userData.email) {
          setUserName(userData.email.split('@')[0]);
        }
        
        setTimeGreeting(getTimeBasedGreeting());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Helper functions for data transformation
  const determineGenderFromHostel = (hostel: Hostel): string => {
    const name = hostel.hostelName?.toLowerCase() || '';
    const type = hostel.hostelType?.toLowerCase() || '';

    if (name.includes('boys') || name.includes('boy') || type === 'boys') return 'Boys';
    if (name.includes('girls') || name.includes('girl') || type === 'girls') return 'Girls';
    if (name.includes('women') || name.includes('womens')) return 'Girls';
    return 'Co-living';
  };

  const extractLocationFromAddress = (address: string): string => {
    if (!address) return 'Unknown Location';

    const areas = [
      'Kukatpally', 'KPHB', 'Kukatpally Housing Board',
      'Dilsukhnagar', 'L.B. Nagar', 'LB Nagar',
      'Secunderabad', 'Sec\'bad',
      'Ameerpet',
      'Hitech City', 'Hi-Tech City',
      'Madhapur',
      'Begumpet',
      'Hyderabad'
    ];

    for (const area of areas) {
      if (address.toLowerCase().includes(area.toLowerCase())) {
        return area;
      }
    }

    // Fallback: try to extract first meaningful word from address
    const words = address.split(',').map(word => word.trim()).filter(word => word.length > 3);
    return words[0] || 'Hyderabad';
  };

  const transformHostelData = (hostel: Hostel) => {
    // Get primary photo or first photo
    const primaryPhoto = hostel.photos?.find(photo => photo.isPrimary) || hostel.photos?.[0];

    // Convert photo URL to absolute URL
    let imageUrl = null;
    if (primaryPhoto?.url) {
      if (primaryPhoto.url.startsWith('http')) {
        imageUrl = primaryPhoto.url;
      } else {
        const normalizedUrl = primaryPhoto.url.startsWith('/')
          ? primaryPhoto.url
          : `/${primaryPhoto.url}`;
        imageUrl = `https://api.fyndom.in${normalizedUrl}`;
      }
    }

    // Convert ALL photos to absolute URLs for details page
    const allPhotos = hostel.photos?.map(photo => {
      let photoUrl = photo.url;
      if (photoUrl && !photoUrl.startsWith('http')) {
        const normalizedUrl = photoUrl.startsWith('/')
          ? photoUrl
          : `/${photoUrl}`;
        photoUrl = `https://api.fyndom.in${normalizedUrl}`;
      }
      return {
        ...photo,
        url: photoUrl
      };
    }) || [];

    // Get sharing options from pricing
    const sharingOptions = [];

    if (hostel.pricing) {
      if (hostel.pricing.single?.monthly?.price !== undefined && hostel.pricing.single?.monthly?.price !== null) {
        sharingOptions.push({
          type: '1 Sharing',
          price: hostel.pricing.single.monthly.price,
          available: hostel.pricing.single.availableBeds || 0
        });
      }
      if (hostel.pricing.double?.monthly?.price !== undefined && hostel.pricing.double?.monthly?.price !== null) {
        sharingOptions.push({
          type: '2 Sharing',
          price: hostel.pricing.double.monthly.price,
          available: hostel.pricing.double.availableBeds || 0
        });
      }
      if (hostel.pricing.triple?.monthly?.price !== undefined && hostel.pricing.triple?.monthly?.price !== null) {
        sharingOptions.push({
          type: '3 Sharing',
          price: hostel.pricing.triple.monthly.price,
          available: hostel.pricing.triple.availableBeds || 0
        });
      }
      if (hostel.pricing.four?.monthly?.price !== undefined && hostel.pricing.four?.monthly?.price !== null) {
        sharingOptions.push({
          type: '4 Sharing',
          price: hostel.pricing.four.monthly.price,
          available: hostel.pricing.four.availableBeds || 0
        });
      }
    }

    const firstSharing = sharingOptions.find(opt => opt.available > 0) || sharingOptions[0];
    const sharingNumber = firstSharing ? parseInt(firstSharing.type.split(' ')[0]) : 2;

    // Calculate rating based on facilities and photos
    const baseRating = 3.5;
    let ratingBonus = 0;

    if (allPhotos.length > 0) {
      ratingBonus += 0.3;
    }

    const facilitiesCount = hostel.facilities?.essentials?.length || 0;
    ratingBonus += Math.min(facilitiesCount * 0.1, 0.5);

    if (hostel.facilities?.essentials?.includes('Air Conditioning')) {
      ratingBonus += 0.2;
    }
    if (hostel.facilities?.essentials?.includes('Free WiFi')) {
      ratingBonus += 0.2;
    }

    const finalRating = Math.min(baseRating + ratingBonus + (Math.random() * 0.6), 5.0);

    return {
      id: hostel._id,
      name: hostel.hostelName || 'Unnamed Hostel',
      address: hostel.address || 'Address not provided',
      price: firstSharing ? `₹${firstSharing.price} / month` : `₹${hostel.startingPrice || 0} / month`,
      location: extractLocationFromAddress(hostel.address),
      rating: parseFloat(finalRating.toFixed(1)),
      image: imageUrl,
      facilities: hostel.facilities?.essentials || [],
      gender: determineGenderFromHostel(hostel),
      sharing: sharingNumber,
      summary: hostel.summary || 'Comfortable accommodation with modern amenities.',
      contact: hostel.contact || 'Not provided',
      email: hostel.email || 'Not provided',
      coordinates: hostel.coordinates || null,
      allPhotos: allPhotos,
      allFacilities: hostel.facilities || {},
      pricing: hostel.pricing || {},
      availabilitySummary: hostel.availabilitySummary || {},
      sharingOptions: sharingOptions,
      startingPrice: hostel.startingPrice || 0,
      recommendationScore: calculateRecommendationScore(hostel, allPhotos.length),
      hostelOwnerId: hostel._id
    };
  };

  const calculateRecommendationScore = (hostel: Hostel, photoCount: number): number => {
    let score = 0;

    score += Math.min(photoCount * 4, 20);

    const facilitiesCount = hostel.facilities?.essentials?.length || 0;
    score += Math.min(facilitiesCount * 1.5, 15);

    const premiumAmenities = ['Air Conditioning', 'Free WiFi', 'CCTV Security', 'Laundry Service'];
    premiumAmenities.forEach(amenity => {
      if (hostel.facilities?.essentials?.includes(amenity)) {
        score += 3;
      }
    });

    const totalAvailableBeds = Object.values(hostel.availabilitySummary || {}).reduce(
      (sum: number, type: any) => sum + (type.availableBeds || 0), 0
    );
    score += Math.min(totalAvailableBeds * 2, 10);

    const basePrice = hostel.startingPrice || 10000;
    if (basePrice < 5000) score += 15;
    else if (basePrice < 8000) score += 10;
    else if (basePrice < 12000) score += 5;

    return Math.round(score);
  };

  const getForYouHostels = (hostels: any[]) => {
    return hostels
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6);
  };

  const getFeaturedHostels = (hostels: any[]) => {
    return hostels
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  };

  // Fetch hostels from API
  const fetchHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiClient.get<HostelsResponse>('/student/hostels');

      if (response.success) {
        console.log("response from the api", response.data);

        const transformedHostels = response.data.map(hostel => transformHostelData(hostel));

        setAllHostels(transformedHostels);
        setFilteredHostels(transformedHostels);
        setHostelsToShow(transformedHostels);

        // Set specialized lists
        setForYouHostels(getForYouHostels(transformedHostels));
        setFeaturedHostels(getFeaturedHostels(transformedHostels));
      } else {
        setError('Failed to fetch hostels');
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError('Failed to load hostels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load user data on focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  useEffect(() => {
    // Request location permission & detect location
    (async () => {
      setLocationLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermStatus(status);
        if (status !== "granted") {
          setDetectedLocation("Location permission denied");
          setLocationLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        const addr = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (addr && addr.length > 0) {
          const city = addr[0].city || addr[0].subregion || addr[0].district;
          setDetectedLocation(city || "Unknown location");
        } else {
          setDetectedLocation("Unknown location");
        }
      } catch (error) {
        setDetectedLocation("Failed to detect location");
      } finally {
        setLocationLoading(false);
      }
    })();

    // Fetch hostels on component mount
    fetchHostels();
    
    // Fetch user data on component mount
    fetchUserData();
  }, []);

  useEffect(() => {
    // Auto-scroll banners
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % banners.length;
      setCurrentBannerIndex(nextIndex);
      bannerScrollRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentBannerIndex]);

  useEffect(() => {
    // Filter based on search and filters
    let filtered = allHostels;
    if (searchText.trim().length > 0) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (h) => h.name.toLowerCase().includes(lowerSearch) || h.location.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedAmenities.length > 0)
      filtered = filtered.filter((h) => selectedAmenities.every((a) => h.facilities.includes(a)));

    if (selectedSharingTypes.length > 0) filtered = filtered.filter((h) => selectedSharingTypes.includes(h.sharing));

    if (selectedGender) filtered = filtered.filter((h) => h.gender === selectedGender);

    filtered = filtered.filter((h) => {
      const priceNum = parseInt(h.price.replace(/[^0-9]/g, ""), 10) || 0;
      return priceNum <= maxPrice;
    });

    setFilteredHostels(filtered);

    // Update specialized lists
    setForYouHostels(getForYouHostels(filtered));
    setFeaturedHostels(getFeaturedHostels(filtered));
  }, [searchText, selectedAmenities, selectedSharingTypes, selectedGender, maxPrice, allHostels]);

  useEffect(() => {
    // Update hostelsToShow based on selected location
    let locationFiltered = filteredHostels;
    
    if (selectedLocationKey !== "nearby") {
      const selectedLocation = locations.find(loc => loc.key === selectedLocationKey);
      if (selectedLocation) {
        // Filter by exact location match
        locationFiltered = filteredHostels.filter((h) => 
          h.location.toLowerCase().includes(selectedLocation.label.toLowerCase())
        );
      }
    }
    
    setHostelsToShow(locationFiltered);
    
    // Update specialized lists based on location filter
    setForYouHostels(getForYouHostels(locationFiltered));
    setFeaturedHostels(getFeaturedHostels(locationFiltered));
  }, [selectedLocationKey, filteredHostels]);

  const toggleAmenity = (item: string) => {
    setSelectedAmenities(selectedAmenities.includes(item) ? selectedAmenities.filter((a) => a !== item) : [...selectedAmenities, item]);
  };

  const toggleSharingType = (sharing: number) => {
    setSelectedSharingTypes(selectedSharingTypes.includes(sharing) ? selectedSharingTypes.filter((r) => r !== sharing) : [...selectedSharingTypes, sharing]);
  };

  const toggleGender = (gender: string) => {
    setSelectedGender(selectedGender === gender ? "" : gender);
  };

  const applyFilters = () => {
    const price = parseInt(priceInput, 10);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid price", "Please enter a valid maximum price.");
      return;
    }
    setMaxPrice(price);
    setFilterVisible(false);
  };

  const cancelFilters = () => {
    setPriceInput(maxPrice.toString());
    setFilterVisible(false);
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedAmenities([]);
    setSelectedSharingTypes([]);
    setSelectedGender("");
    setMaxPrice(20000);
    setPriceInput("20000");
    setSelectedLocationKey("nearby");
  };

  // Function to remove specific filter
  const removeFilter = (type: string, value?: any) => {
    switch (type) {
      case 'amenity':
        setSelectedAmenities(selectedAmenities.filter(a => a !== value));
        break;
      case 'sharing':
        setSelectedSharingTypes(selectedSharingTypes.filter(s => s !== value));
        break;
      case 'gender':
        setSelectedGender("");
        break;
      case 'price':
        setMaxPrice(20000);
        setPriceInput("20000");
        break;
      case 'location':
        setSelectedLocationKey("nearby");
        break;
      case 'all':
        clearAllFilters();
        break;
    }
  };

  const onShare = async () => {
    try {
      const message = `🚀 Discover the Best Hostel Experience with Fyndom! 🏠

Join me on Fyndom - the ultimate platform for finding perfect hostels and PGs! 

✨ Why Choose Fyndom?
• 5000+ Verified Hostels
• Best Prices Guaranteed
• Safety & Quality Assured
• Easy Booking Process

🎁 Special Offer for You:
Use my referral code "${referralCode}" during signup and get:
✅ ₹250 OFF on your first booking
✅ Priority customer support
✅ Exclusive member benefits

💰 I'll also earn ₹250 when you complete your first booking!

📱 Download Fyndom Now: https://fyndom.app/download

🔑 Referral Code: ${referralCode}

Don't settle for less - find your perfect home away from home with Fyndom! 🏡💫`;

      await Share.share({
        message,
        title: 'Join Fyndom - Get ₹250 OFF!'
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the referral message");
    }
  };

  const copyReferralCode = () => {
    Alert.alert("Referral Code Copied!", `Code: ${referralCode}\n\nShare this code with your friends!`);
  };

  const handleBannerScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentBannerIndex(pageNum);
  };

  const renderBannerItem = ({ item, index }: { item: any; index: number }) => (
    <View style={[styles.bannerCard, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
      <Image source={item.img} style={styles.bannerImg} />
    </View>
  );

  const renderHostelCard = ({ item }: any) => (
    <View style={[styles.featuredCard, { 
      backgroundColor: isDark ? "#121212" : "#fff", 
      borderColor: isDark ? "#333333" : "#e0e0e0",
      shadowColor: isDark ? "#000000" : "#222" 
    }]}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.featuredImg} />
      ) : (
        <View style={[styles.noImageContainer, { backgroundColor: isDark ? "#2d2d2d" : "#f5f5f5" }]}>
          <Ionicons name="home-outline" size={40} color={isDark ? "#666" : "#ccc"} />
          <Text style={[styles.noImageText, { color: isDark ? "#999" : "#999" }]}>No Image</Text>
        </View>
      )}
      <View style={styles.featuredContent}>
        <Text style={[styles.featuredName, { color: isDark ? "#EEEEEE" : "#222831" }]}>{item.name}</Text>
        <Text style={[styles.featuredLoc, { color: isDark ? "#A5D6A7" : "#3a6351" }]}>
          {item.location} • {item.price}
        </Text>
        <Text style={[styles.featuredAddress, { color: isDark ? "#EEEEEE" : "#636363" }]} numberOfLines={1}>
          {item.address || ""}
        </Text>
        <Text style={[styles.featuredRating, { color: isDark ? "#FFD801" : "#ff7b54" }]}>⭐ {item.rating.toFixed(1)}</Text>

        {/* Display Available Beds */}
        <View style={styles.availabilityRow}>
          {item.pricing?.single?.availableBeds > 0 && (
            <View style={[styles.availabilityTag, { backgroundColor: isDark ? "#0d47a1" : "#e3f2fd" }]}>
              <Text style={[styles.availabilityText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>1: {item.pricing.single.availableBeds}</Text>
            </View>
          )}
          {item.pricing?.double?.availableBeds > 0 && (
            <View style={[styles.availabilityTag, { backgroundColor: isDark ? "#0d47a1" : "#e3f2fd" }]}>
              <Text style={[styles.availabilityText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>2: {item.pricing.double.availableBeds}</Text>
            </View>
          )}
          {item.pricing?.triple?.availableBeds > 0 && (
            <View style={[styles.availabilityTag, { backgroundColor: isDark ? "#0d47a1" : "#e3f2fd" }]}>
              <Text style={[styles.availabilityText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>3: {item.pricing.triple.availableBeds}</Text>
            </View>
          )}
          {item.pricing?.four?.availableBeds > 0 && (
            <View style={[styles.availabilityTag, { backgroundColor: isDark ? "#0d47a1" : "#e3f2fd" }]}>
              <Text style={[styles.availabilityText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>4: {item.pricing.four.availableBeds}</Text>
            </View>
          )}
        </View>

        <View style={styles.facilitiesRow}>
          {item.facilities.slice(0, 3).map((f: string, i: number) => (
            <View key={i} style={[styles.facilityTag, { backgroundColor: isDark ? "#1e3a1e" : "#c7e47e" }]}>
              <Text style={[styles.facilityText, { color: isDark ? "#A5D6A7" : "#155a46" }]}>{f}</Text>
            </View>
          ))}
          {item.facilities.length > 3 && (
            <View style={[styles.facilityTag, { backgroundColor: isDark ? "#1e3a1e" : "#c7e47e" }]}>
              <Text style={[styles.facilityText, { color: isDark ? "#A5D6A7" : "#155a46" }]}>+{item.facilities.length - 3}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.featuredBtn, { backgroundColor: isDark ? "#FFD801" : "#219150" }]}
          onPress={() =>
            router.push({
              pathname: "/HostelDetails",
              params: {
                hostel: JSON.stringify({
                  id: item.id,
                  hostelOwnerId: item.hostelOwnerId || item.id,
                  name: item.name,
                  address: item.address,
                  contact: item.contact,
                  email: item.email,
                  hostelType: item.hostelType || '',      // if you have it on item
                  rating: item.rating,
                  summary: item.summary,
                  photos: item.allPhotos || item.photos,  // matches HostelData.photos [file:3]
                  pricing: item.pricing || {},            // used for fallback pricing [file:3]
                  allFacilities: item.allFacilities || {
                    roomSharingTypes: [],
                    bathroomTypes: [],
                    essentials: [],
                    foodServices: [],
                  },
                  coordinates: item.coordinates || { latitude: 0, longitude: 0 },
                  startingPrice: item.startingPrice || 0,
                  availabilitySummary: item.availabilitySummary || {},
                  sharingOptions: item.sharingOptions || [],
                  allPhotos: item.allPhotos || item.photos || [],
                }),
              },
            })
          }
        >
          <Text style={[styles.featuredBtnText, { color: isDark ? "#000000" : "#fff" }]}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOfferCard = ({ item }: any) => (
    <View style={[styles.offerRectCard, { 
      backgroundColor: isDark ? "#121212" : "#fff", 
      borderColor: isDark ? "#333333" : "#e9e9e9",
      shadowColor: isDark ? "#000000" : "#000" 
    }]}>
      <Image source={item.icon} style={styles.offerRectIcon} resizeMode="contain" />
      <Text style={[styles.offerRectTitle, { color: isDark ? "#EEEEEE" : "#000000" }]}>{item.title}</Text>
    </View>
  );

  const renderReferCard = ({ item }: any) => (
    <ImageBackground source={item.bgImage} style={styles.referCardBg} imageStyle={styles.referCardImageStyle}>
      <View style={[styles.referOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]} />
      <View style={styles.referIconContainer}>
        <Ionicons name={item.icon as any} size={36} color={isDark ? "#FFD801" : "#FFD600"} />
      </View>
      <View style={styles.referTextContainer}>
        <Text style={styles.referTitle}>{item.title}</Text>
        <Text style={styles.referDesc}>{item.desc}</Text>
      </View>
    </ImageBackground>
  );

  const handleSeeAll = (section?: string) => {
    let hostelsToSend = [];
    let title = 'All Hostels';
    let sectionType = 'all';

    if (section === 'forYou') {
      hostelsToSend = forYouHostels;
      title = 'Recommended For You';
      sectionType = 'forYou';
    } else if (section === 'featured') {
      hostelsToSend = featuredHostels;
      title = 'Featured Hostels';
      sectionType = 'featured';
    } else {
      hostelsToSend = hostelsToShow;
    }

    router.push({
      pathname: "/AllHostels",
      params: {
        hostels: JSON.stringify(hostelsToSend),
        title: title,
        sectionType: sectionType
      }
    });
  };

  const renderLocationItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.locationItem, 
        selectedLocationKey === item.key && styles.locationItemSelected,
        { borderColor: selectedLocationKey === item.key ? (isDark ? "#3498db" : "#2980b9") : 'transparent' }
      ]}
      onPress={() => setSelectedLocationKey(item.key)}
      activeOpacity={0.7}
    >
      <View style={[styles.locationCircle, { 
        backgroundColor: isDark ? "#1e1e1e" : "#feffffff",
        borderColor: selectedLocationKey === item.key ? (isDark ? "#3498db" : "#2980b9") : 'transparent'
      }]}>
        <Image source={item.icon} style={styles.locationIcon} resizeMode="cover" />
      </View>
      <Text style={[styles.locationLabel, { 
        color: selectedLocationKey === item.key ? (isDark ? "#3498db" : "#2980b9") : (isDark ? "#EEEEEE" : "#0e0f0fff"),
        fontWeight: selectedLocationKey === item.key ? '700' : '500'
      }]} numberOfLines={1}>
        {item.shortLabel || item.label}
      </Text>
    </TouchableOpacity>
  );

  const onSearchPress = () => {
    if (searchText.trim().length > 0) {
      router.push({
        pathname: "/Search",
        params: { query: searchText.trim() }
      });
      Keyboard.dismiss();
    } else {
      Alert.alert("Please enter search text");
    }
  };

  const boysHostels = hostelsToShow.filter((h) => h.gender === "Boys");
  const girlsHostels = hostelsToShow.filter((h) => h.gender === "Girls");

  // Banner pagination dots
  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {banners.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentBannerIndex === index 
              ? [styles.paginationDotActive, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]
              : [styles.paginationDotInactive, { backgroundColor: isDark ? "#666" : "#ccc" }],
          ]}
        />
      ))}
    </View>
  );

  // Render filter chips
  const renderFilterChips = () => {
    if (!hasActiveFilters) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
        >
          {/* Location Filter Chip */}
          {selectedLocationKey !== "nearby" && (
            <View style={[styles.filterChip, { 
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd", 
              borderColor: isDark ? "#3498db" : "#2980b9" 
            }]}>
              <Text style={[styles.filterChipText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>
                {locations.find(l => l.key === selectedLocationKey)?.label || selectedLocationKey}
              </Text>
              <TouchableOpacity
                onPress={() => removeFilter('location')}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color={isDark ? "#bbdefb" : "#1976d2"} />
              </TouchableOpacity>
            </View>
          )}

          {/* Price Filter Chip */}
          {maxPrice < 20000 && (
            <View style={[styles.filterChip, { 
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd", 
              borderColor: isDark ? "#3498db" : "#2980b9" 
            }]}>
              <Text style={[styles.filterChipText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>Price: Up to ₹{maxPrice}</Text>
              <TouchableOpacity
                onPress={() => removeFilter('price')}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color={isDark ? "#bbdefb" : "#1976d2"} />
              </TouchableOpacity>
            </View>
          )}

          {/* Gender Filter Chip */}
          {selectedGender && (
            <View style={[styles.filterChip, { 
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd", 
              borderColor: isDark ? "#3498db" : "#2980b9" 
            }]}>
              <Text style={[styles.filterChipText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>Gender: {selectedGender}</Text>
              <TouchableOpacity
                onPress={() => removeFilter('gender')}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color={isDark ? "#bbdefb" : "#1976d2"} />
              </TouchableOpacity>
            </View>
          )}

          {/* Sharing Type Filter Chips */}
          {selectedSharingTypes.map((sharing) => (
            <View key={`sharing-${sharing}`} style={[styles.filterChip, { 
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd", 
              borderColor: isDark ? "#3498db" : "#2980b9" 
            }]}>
              <Text style={[styles.filterChipText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>{sharing} Sharing</Text>
              <TouchableOpacity
                onPress={() => removeFilter('sharing', sharing)}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color={isDark ? "#bbdefb" : "#1976d2"} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Amenities Filter Chips */}
          {selectedAmenities.map((amenity) => (
            <View key={`amenity-${amenity}`} style={[styles.filterChip, { 
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd", 
              borderColor: isDark ? "#3498db" : "#2980b9" 
            }]}>
              <Text style={[styles.filterChipText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>{amenity}</Text>
              <TouchableOpacity
                onPress={() => removeFilter('amenity', amenity)}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color={isDark ? "#bbdefb" : "#1976d2"} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Clear All Button */}
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: isDark ? "#b71c1c" : "#ff6b6b" }]}
            onPress={() => removeFilter('all')}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Combined loading state for hostels and user data
  const isLoading = loading || userLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.pageBg, { backgroundColor: isDark ? "#000000" : "#fff" }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? "#3498db" : "#2980b9"} />
          <Text style={[styles.loadingText, { color: isDark ? "#EEEEEE" : "#2980b9" }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && allHostels.length === 0) {
    return (
      <SafeAreaView style={[styles.pageBg, { backgroundColor: isDark ? "#000000" : "#fff" }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? "#EEEEEE" : "#ff6b6b" }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]} 
            onPress={fetchHostels}
          >
            <Text style={[styles.retryButtonText, { color: isDark ? "#000000" : "#fff" }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.pageBg, { backgroundColor: isDark ? "#000000" : "#fff" }]} edges={[]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={{ ...styles.scrollAll, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
        {/* Updated Header Card - No rounded corners and extends up */}
        <View style={[styles.headerCard, { backgroundColor: isDark ? "#1a1a1a" : "#fdfde7ff" }]}>
          <View style={styles.cardRow}>
            <Image source={require("../../assets/logo.png")} style={styles.logoLarge} />
            <View style={styles.headerRightActions}>
              <TouchableOpacity onPress={() => router.push("/Notifications")} style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={27} color={isDark ? "#EEEEEE" : "#222831"} style={{ marginRight: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  // Refresh user data before navigating to profile
                  await fetchUserData();
                  router.push("/Profile");
                }} 
                style={styles.iconButton}
              >
                <Ionicons name="person-circle-outline" size={27} color={isDark ? "#EEEEEE" : "#222831"} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={isDark ? "#EEEEEE" : "#000"} />
            <Text style={[styles.locationDetectText, { color: isDark ? "#EEEEEE" : "#000000" }]}>{locationLoading ? "Detecting location..." : detectedLocation}</Text>
          </View>
          <Text style={[styles.welcomeText, { color: isDark ? "#3498db" : "#2980b9" }]}>
            {timeGreeting},{"\n"}
            {userName}
          </Text>
          <View style={[styles.searchWrap, { backgroundColor: isDark ? "#2d2d2d" : "#ffffffff" }]}>
            <Ionicons name="search-outline" size={20} color={isDark ? "#EEEEEE" : "#555"} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search hostels, areas..."
              placeholderTextColor={isDark ? "#aaa" : "#aaa"}
              style={[styles.searchInputSmall, { color: isDark ? "#EEEEEE" : "#222831" }]}
              returnKeyType="search"
              onSubmitEditing={onSearchPress}
            />
            <TouchableOpacity onPress={onSearchPress} style={{ paddingHorizontal: 6 }}>
              <Ionicons name="arrow-forward-circle-outline" size={24} color={isDark ? "#3498db" : "#2980b9"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <Ionicons
                name="options-outline"
                size={20}
                color={hasActiveFilters ? (isDark ? "#3498db" : "#2980b9") : (isDark ? "#EEEEEE" : "#555")}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>

          {/* Filter Chips Section */}
          {renderFilterChips()}
        </View>

        <View style={styles.locationsContainer}>
          <FlatList 
            data={locations} 
            renderItem={renderLocationItem} 
            keyExtractor={(item) => item.key} 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 12 }} 
          />
        </View>

        {/* Updated Banner Section */}
        <View style={styles.bannerSection}>
          <FlatList
            ref={bannerScrollRef}
            data={banners}
            renderItem={renderBannerItem}
            keyExtractor={(_, index) => `banner-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleBannerScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          {renderPaginationDots()}
        </View>

        {/* For You Section */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#EEEEEE" : "#222831" }]}>For You</Text>
          <TouchableOpacity onPress={() => handleSeeAll('forYou')}>
            <Text style={[styles.seeAllBtn, { color: isDark ? "#3498db" : "#2980b9" }]}>See All ▸</Text>
          </TouchableOpacity>
        </View>
        {forYouHostels.length > 0 ? (
          <FlatList
            data={forYouHostels}
            renderItem={renderHostelCard}
            keyExtractor={(item) => "foryou-" + item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListRow}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" }]}>
            <Text style={[styles.emptyStateText, { color: isDark ? "#EEEEEE" : "#666" }]}>No hostels match your preferences</Text>
            <TouchableOpacity
              style={[styles.clearFiltersButton, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]}
              onPress={clearAllFilters}
            >
              <Text style={[styles.clearFiltersText, { color: isDark ? "#000000" : "#fff" }]}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Hostels Section */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#EEEEEE" : "#222831" }]}>Featured Hostels</Text>
          <TouchableOpacity onPress={() => handleSeeAll('featured')}>
            <Text style={[styles.seeAllBtn, { color: isDark ? "#3498db" : "#2980b9" }]}>See All ▸</Text>
          </TouchableOpacity>
        </View>
        {featuredHostels.length > 0 ? (
          <FlatList
            data={featuredHostels}
            renderItem={renderHostelCard}
            keyExtractor={(item) => "featured-" + item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListRow}
          />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" }]}>
            <Text style={[styles.emptyStateText, { color: isDark ? "#EEEEEE" : "#666" }]}>No featured hostels available</Text>
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#EEEEEE" : "#222831" }]}>Offers for You</Text>
          <TouchableOpacity onPress={handleSeeAll}>
            <Text style={[styles.seeAllBtn, { color: isDark ? "#3498db" : "#2980b9" }]}>See All ▸</Text>
          </TouchableOpacity>
        </View>
        <FlatList data={offers} renderItem={renderOfferCard} keyExtractor={(_, i) => "offer" + i} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 12, paddingVertical: 14 }} />

        <Text style={[styles.sectionTitle, { color: isDark ? "#EEEEEE" : "#222831", marginLeft: 12 }]}>Refer & Win</Text>
        <FlatList data={referCards} renderItem={renderReferCard} keyExtractor={(_, i) => "refer" + i} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} contentContainerStyle={{ paddingLeft: 12, paddingVertical: 14 }} />

        {/* Enhanced About Refer and Earn Section */}
        <View style={[styles.aboutReferContainer, { 
          backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa",
          shadowColor: isDark ? "#000000" : "#000" 
        }]}>
          <Text style={[styles.aboutReferTitle, { color: isDark ? "#EEEEEE" : "#222831" }]}>About Refer and Earn Program</Text>

          <View style={[styles.referralStatsContainer, { 
            backgroundColor: isDark ? "#121212" : "#fff",
            shadowColor: isDark ? "#000000" : "#000" 
          }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? "#3498db" : "#2980b9" }]}>₹{referralStats.totalEarned}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#EEEEEE" : "#666" }]}>Total Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? "#3498db" : "#2980b9" }]}>{referralStats.successfulReferrals}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#EEEEEE" : "#666" }]}>Successful</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: isDark ? "#3498db" : "#2980b9" }]}>{referralStats.pendingReferrals}</Text>
              <Text style={[styles.statLabel, { color: isDark ? "#EEEEEE" : "#666" }]}>Pending</Text>
            </View>
          </View>

          <Text style={[styles.aboutReferSubTitle, { color: isDark ? "#3498db" : "#2980b9" }]}>How It Works:</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]}>
                <Text style={[styles.stepNumberText, { color: isDark ? "#000000" : "#fff" }]}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? "#EEEEEE" : "#444" }]}>Share your referral code with friends</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]}>
                <Text style={[styles.stepNumberText, { color: isDark ? "#000000" : "#fff" }]}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? "#EEEEEE" : "#444" }]}>Your friend signs up using your code</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]}>
                <Text style={[styles.stepNumberText, { color: isDark ? "#000000" : "#fff" }]}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? "#EEEEEE" : "#444" }]}>They complete their first booking</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]}>
                <Text style={[styles.stepNumberText, { color: isDark ? "#000000" : "#fff" }]}>4</Text>
              </View>
              <Text style={[styles.stepText, { color: isDark ? "#EEEEEE" : "#444" }]}>You get ₹250 credited to your Fyndom account</Text>
            </View>
          </View>

          <View style={[styles.referralCodeContainer, { 
            backgroundColor: isDark ? "#121212" : "#fff",
            shadowColor: isDark ? "#000000" : "#000" 
          }]}>
            <Text style={[styles.referralCodeLabel, { color: isDark ? "#EEEEEE" : "#222831" }]}>Your Referral Code:</Text>
            <TouchableOpacity style={[styles.referralCodeBox, { 
              backgroundColor: isDark ? "#1e3a5f" : "#e3f2fd",
              borderColor: isDark ? "#3498db" : "#2980b9" 
            }]} onPress={copyReferralCode}>
              <Text style={[styles.referralCodeText, { color: isDark ? "#bbdefb" : "#1976d2" }]}>{referralCode}</Text>
              <Ionicons name="copy-outline" size={20} color={isDark ? "#bbdefb" : "#1976d2"} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.aboutReferText, { color: isDark ? "#EEEEEE" : "#444" }]}>
            Invite your friends to Fyndom and earn exciting rewards every time they complete their first booking.
            Your friends will also get ₹250 OFF on their first booking when they use your referral code.
            It's a win-win for everyone! Share your referral code via WhatsApp, Instagram, or any other platform and start earning today.
          </Text>

          <Text style={[styles.termsText, { color: isDark ? "#aaaaaa" : "#666" }]}>
            * Terms: Reward is credited only after your friend completes their first booking. Maximum earnings capped at ₹5000 per month.
          </Text>

          <TouchableOpacity style={[styles.shareButton, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]} onPress={onShare}>
            <Ionicons name="share-social-outline" size={20} color={isDark ? "#000000" : "#fff"} />
            <Text style={[styles.shareButtonText, { color: isDark ? "#000000" : "#fff" }]}>Share Referral</Text>
          </TouchableOpacity>
        </View>

        {/* Boys Hostels Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? "#EEEEEE" : "#222831" }]}>Boys Hostels</Text>
        {boysHostels.length > 0 ? (
          <FlatList data={boysHostels} renderItem={renderHostelCard} keyExtractor={(item) => "boy-" + item.id} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" }]}>
            <Text style={[styles.emptyStateText, { color: isDark ? "#EEEEEE" : "#666" }]}>No boys hostels available</Text>
          </View>
        )}

        {/* Girls Hostels Section */}
        <Text style={[styles.sectionTitle, { color: isDark ? "#EEEEEE" : "#222831" }]}>Girls Hostels</Text>
        {girlsHostels.length > 0 ? (
          <FlatList data={girlsHostels} renderItem={renderHostelCard} keyExtractor={(item) => "girl-" + item.id} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} />
        ) : (
          <View style={[styles.emptyState, { backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa" }]}>
            <Text style={[styles.emptyStateText, { color: isDark ? "#EEEEEE" : "#666" }]}>No girls hostels available</Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
          </TouchableWithoutFeedback>
          <View style={[styles.filterModalContent, { backgroundColor: isDark ? "#121212" : "#fff" }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.filterModalTitle, { color: isDark ? "#3498db" : "#2980b9" }]}>Filters</Text>
              <Text style={[styles.filterSectionTitle, { color: isDark ? "#3498db" : "#2980b9" }]}>Amenities</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {amenitiesOptions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{ flexDirection: "row", alignItems: "center", width: "50%", marginVertical: 6 }}
                    onPress={() => toggleAmenity(item)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedAmenities.includes(item) ? (isDark ? "#3498db" : "#2980b9") : (isDark ? "#EEEEEE" : "#9e9e9e"),
                          backgroundColor: selectedAmenities.includes(item) ? (isDark ? "#3498db" : "#2980b9") : "transparent",
                        },
                      ]}
                    >
                      {selectedAmenities.includes(item) && <View style={[styles.checkboxInner, { backgroundColor: isDark ? "#121212" : "#fff" }]} />}
                    </View>
                    <Text style={[styles.filterOptionText, { color: isDark ? "#EEEEEE" : "#222831" }]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.filterSectionTitle, { color: isDark ? "#3498db" : "#2980b9" }]}>Max Price</Text>
              <TextInput
                value={priceInput}
                onChangeText={(val) => setPriceInput(val.replace(/\D/g, ""))}
                placeholder="Max Price"
                placeholderTextColor={isDark ? "#aaa" : "#888"}
                keyboardType="numeric"
                style={[styles.priceInput, { 
                  color: isDark ? "#EEEEEE" : "#222222", 
                  borderColor: isDark ? "#333333" : "#ccc",
                  backgroundColor: isDark ? "#1e1e1e" : "#fff" 
                }]}
                maxLength={6}
              />
              <Text style={[styles.filterSectionTitle, { color: isDark ? "#3498db" : "#2980b9" }]}>Sharing</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {sharingOptions.map((sharing) => (
                  <TouchableOpacity
                    key={sharing}
                    style={{ flexDirection: "row", alignItems: "center", width: "33%", marginVertical: 6 }}
                    onPress={() => toggleSharingType(sharing)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedSharingTypes.includes(sharing) ? (isDark ? "#3498db" : "#2980b9") : (isDark ? "#EEEEEE" : "#9e9e9e"),
                          backgroundColor: selectedSharingTypes.includes(sharing) ? (isDark ? "#3498db" : "#2980b9") : "transparent",
                        },
                      ]}
                    >
                      {selectedSharingTypes.includes(sharing) && <View style={[styles.checkboxInner, { backgroundColor: isDark ? "#121212" : "#fff" }]} />}
                    </View>
                    <Text style={[styles.filterOptionText, { color: isDark ? "#EEEEEE" : "#222831" }]}>{sharing} Sharing</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.filterSectionTitle, { color: isDark ? "#3498db" : "#2980b9" }]}>Gender</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {genderOptions.map((gender, i) => (
                  <TouchableOpacity key={i} style={{ flexDirection: "row", alignItems: "center", width: "33%", marginVertical: 6 }} onPress={() => toggleGender(gender)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedGender === gender ? (isDark ? "#3498db" : "#2980b9") : (isDark ? "#EEEEEE" : "#9e9e9e"),
                          backgroundColor: selectedGender === gender ? (isDark ? "#3498db" : "#2980b9") : "transparent",
                        },
                      ]}
                    >
                      {selectedGender === gender && <View style={[styles.checkboxInner, { backgroundColor: isDark ? "#121212" : "#fff" }]} />}
                    </View>
                    <Text style={[styles.filterOptionText, { color: isDark ? "#EEEEEE" : "#222831" }]}>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: isDark ? "#6b7280" : "#a1a1aa" }]} onPress={cancelFilters}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.applyBtn, { backgroundColor: isDark ? "#3498db" : "#2980b9" }]} onPress={applyFilters}>
                  <Text style={{ color: isDark ? "#000000" : "#fff", fontWeight: "600" }}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageBg: { flex: 1, paddingTop: 0 },
  scrollAll: { paddingBottom: 22 },
  bannerSection: {
    marginVertical: 10,
    position: 'relative',
  },
  bannerCard: {
    width: width - 24,
    height: 200,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginHorizontal: 12,
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 14,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 20,
  },
  paginationDotInactive: {
    backgroundColor: '#ccc',
  },
  // Updated Header Card styles - no rounded corners
  headerCard: {
    elevation: 3,
    shadowColor: "#222831",
    shadowRadius: 7,
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 2 },
    marginHorizontal: 0,
    paddingHorizontal: 12,
    paddingBottom: 15,
    paddingTop: 10,
    minHeight: 64,
    justifyContent: "flex-start",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  cardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 0, marginTop: 0 },
  logoLarge: {
    width: 130,
    height: 110,
    resizeMode: "contain",
    marginLeft: 4,
    marginTop: -6,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 0,
    paddingRight: 4
  },
  iconButton: {
    paddingTop: 0,
    height: 55,
    marginTop: -6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    marginBottom: 8,
    marginTop: -15,
  },
  locationDetectText: { fontSize: 16, fontWeight: "normal", marginLeft: 6 },
  welcomeText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 0,
    textAlign: "left",
    letterSpacing: 1,
    marginLeft: 4,
  },
  searchWrap: { flexDirection: "row", alignItems: "center", borderRadius: 14, paddingHorizontal: 10, height: 40, marginTop: 6 },
  searchInputSmall: { flex: 1, marginLeft: 8, fontSize: 16, height: 38 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, marginHorizontal: 12 },
  sectionTitle: { fontWeight: "bold", fontSize: 18, marginVertical: 8, marginLeft: 12 },
  seeAllBtn: { fontSize: 13, fontWeight: "700", paddingHorizontal: 6 },
  flatListRow: { marginVertical: 7, minHeight: 110, paddingLeft: 10 },
  featuredCard: {
    borderRadius: 12,
    width: width * 0.6,
    marginRight: 12,
    borderWidth: 1,
    shadowOpacity: 0.06,
    elevation: 3,
    padding: 10,
  },
  featuredImg: { width: "100%", height: 120, borderRadius: 8, marginBottom: 6 },
  featuredContent: { flex: 1, justifyContent: "space-between" },
  featuredName: { fontWeight: "bold", fontSize: 14 },
  featuredLoc: { fontSize: 12, marginVertical: 3 },
  featuredAddress: { fontSize: 11, marginBottom: 2, fontWeight: "600", width: "100%" },
  featuredRating: { fontSize: 12, marginVertical: 2 },
  facilitiesRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  facilityTag: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, marginTop: 6 },
  facilityText: { fontWeight: "700", fontSize: 12 },
  featuredBtn: { borderRadius: 8, marginTop: 6, paddingVertical: 6, alignItems: "center" },
  featuredBtnText: { fontWeight: "700", fontSize: 12 },
  offerRectCard: {
    flexDirection: "row",
    borderRadius: 12,
    width: width * 0.8,
    height: 110,
    marginRight: 20,
    alignItems: "center",
    paddingHorizontal: 24,
    borderWidth: 1,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  offerRectIcon: { width: 80, height: 80, borderRadius: 14, marginRight: 28 },
  offerRectTitle: { fontWeight: "bold", fontSize: 16, flexShrink: 1 },
  referCardBg: {
    width: width * 0.8,
    height: 170,
    borderRadius: 18,
    marginRight: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  referCardImageStyle: { borderRadius: 18, resizeMode: "cover" },
  referOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  referIconContainer: { marginRight: 20, zIndex: 10 },
  referTextContainer: { flex: 1, zIndex: 10 },
  referTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  referDesc: { fontSize: 16, color: "#f3f3f3", marginTop: 6 },
  // Enhanced About Refer Section Styles
  aboutReferContainer: {
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutReferTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  aboutReferSubTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  referralStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  stepsContainer: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  referralCodeContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  referralCodeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  referralCodeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
  },
  referralCodeText: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  aboutReferText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  termsText: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 16,
    lineHeight: 16,
  },
  shareButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  filterModalContent: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: height * 0.75,
    minHeight: height * 0.4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  filterModalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  filterSectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  cancelBtn: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: "center", marginRight: 8 },
  applyBtn: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: "center", marginLeft: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: 10 },
  checkboxInner: { width: 12, height: 12, borderRadius: 3 },
  filterOptionText: { fontSize: 13 },
  priceInput: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 14, fontSize: 13, width: "100%" },
  locationsContainer: { 
    marginTop: 12, 
    paddingLeft: 12, 
    paddingBottom: 6,
    minHeight: 90 
  },
  locationItem: { 
    alignItems: "center", 
    marginRight: 16,
    width: 70,
  },
  locationCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 6, 
    overflow: "hidden",
    borderWidth: 2,
  },
  locationIcon: { 
    width: "100%", 
    height: "100%", 
    borderRadius: 28 
  },
  locationLabel: { 
    fontSize: 12, 
    fontWeight: "500", 
    textAlign: "center", 
    width: "100%",
    paddingHorizontal: 2,
  },
  locationItemSelected: {
    borderRadius: 30,
    padding: 2,
  },
  // Filter Chips Styles
  filterChipsContainer: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  filterChipsContent: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  filterChipClose: {
    padding: 2,
  },
  clearAllButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 4,
  },
  clearAllText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    borderRadius: 12,
    marginVertical: 10,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  availabilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  availabilityTag: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
});