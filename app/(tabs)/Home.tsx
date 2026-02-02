// app/(tabs)/Home.tsx - FIXED: NO AUTO NEARBY SELECTION
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/reduxStore/store/store";
import { getReferralStats } from "../../app/reduxStore/reduxSlices/authSlice";
import HostelService from "../../app/api/HostelService";
import LocationService from "../../app/api/LocationService";

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
  icon: ImageSourcePropType;
  area: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
};

const locations: LocationType[] = [
  { key: "nearby", label: "Nearby", icon: nearbyIcon, area: "nearby" },
  { key: "kukatpally", label: "Kukatpally", icon: kukatpallyIcon, area: "Kukatpally", coordinates: { latitude: 17.4849, longitude: 78.4138 } },
  { key: "lb_nagar", label: "Dilsukhnagar", icon: lbNagarIcon, area: "L.B. Nagar", coordinates: { latitude: 17.3676, longitude: 78.5260 } },
  { key: "secunderabad", label: "Secunderabad", icon: secunderabadIcon, area: "Secunderabad", coordinates: { latitude: 17.4399, longitude: 78.4983 } },
  { key: "ameerpet", label: "Ameerpet", icon: ameerpetIcon, area: "Ameerpet", coordinates: { latitude: 17.4375, longitude: 78.4483 } },
  { key: "hitech_city", label: "Hitech City", icon: hitechCityIcon, area: "Hitech City", coordinates: { latitude: 17.4474, longitude: 78.3765 } },
  { key: "madhapur", label: "Madhapur", icon: madhapurIcon, area: "Madhapur", coordinates: { latitude: 17.4484, longitude: 78.3915 } },
  { key: "begumpet", label: "Begumpet", icon: begumpetIcon, area: "Begumpet", coordinates: { latitude: 17.4415, longitude: 78.4669 } },
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

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const [locationPermStatus, setLocationPermStatus] = useState<string>("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedSharingTypes, setSelectedSharingTypes] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [priceInput, setPriceInput] = useState(maxPrice.toString());
  const [selectedGender, setSelectedGender] = useState<string>("");

  // FIX: No default selection
  const [selectedLocationKey, setSelectedLocationKey] = useState<string>("");
  const [loadingLocationData, setLoadingLocationData] = useState(false);

  const [allHostels, setAllHostels] = useState<any[]>([]);
  const [filteredHostels, setFilteredHostels] = useState<any[]>([]);
  const [hostelsToShow, setHostelsToShow] = useState<any[]>([]);
  const [forYouHostels, setForYouHostels] = useState<any[]>([]);
  const [featuredHostels, setFeaturedHostels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userName, setUserName] = useState<string>("Guest");
  const [timeGreeting, setTimeGreeting] = useState<string>("Welcome Back");
  const [userLoading, setUserLoading] = useState(true);

  const [referralCode, setReferralCode] = useState("FYNDOM250");
  const [referralStats, setReferralStats] = useState({
    totalEarned: 0,
    successfulReferrals: 0,
    pendingReferrals: 0
  });

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<FlatList>(null);

  const [locationHostels, setLocationHostels] = useState<any[]>([]);
  const [areaHostels, setAreaHostels] = useState<any[]>([]);

  const hasActiveFilters = selectedAmenities.length > 0 ||
    selectedSharingTypes.length > 0 ||
    selectedGender !== "" ||
    maxPrice < 20000;

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchUserData = async () => {
    try {
      setUserLoading(true);
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData?.user?.fullName) {
          const nameParts = userData.user.fullName.split(' ');
          setUserName(nameParts[0] || userData.user.fullName);
        } else if (userData?.user?.email) {
          setUserName(userData.user.email.split('@')[0]);
        } else {
          setUserName("Guest");
        }
      } else {
        const token = await AsyncStorage.getItem('accessToken');
        setUserName(token ? "User" : "Guest");
      }
      setTimeGreeting(getTimeBasedGreeting());
      
      if (auth.referralData) {
        setReferralCode(auth.referralData.referralCode || "FYNDOM250");
        setReferralStats({
          totalEarned: auth.referralData.referralPoints || 0,
          successfulReferrals: auth.referralData.referralCount || 0,
          pendingReferrals: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserName("Guest");
    } finally {
      setUserLoading(false);
    }
  };

  const fetchReferralData = async () => {
    try {
      if (auth.isAuthenticated && auth.token) {
        await dispatch(getReferralStats());
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
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

  // FIX: Only get user location when explicitly requested
  const getUserLocation = async (requestForNearby = false) => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermStatus(status);
      
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        
        const address = await Location.reverseGeocodeAsync({ 
          latitude, 
          longitude 
        });
        
        if (address && address.length > 0) {
          const city = address[0].city || address[0].subregion || address[0].district;
          setDetectedLocation(city || "Your location");
        } else {
          setDetectedLocation("Your location");
        }
        
        // Only fetch nearby hostels if requested for "Nearby" feature
        if (requestForNearby) {
          return { latitude, longitude };
        }
      } else {
        setDetectedLocation("Location permission denied");
      }
    } catch (error) {
      console.warn('Location error:', error);
      setDetectedLocation("Failed to detect location");
    } finally {
      setLocationLoading(false);
    }
    return null;
  };

  const fetchAllHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await HostelService.getAllHostels();
      
      if (response.success && response.data) {
        setAllHostels(response.data);
        setFilteredHostels(response.data);
        // FIX: Show all hostels by default, not nearby
        setHostelsToShow(response.data);

        const forYou = getForYouHostels(response.data);
        const featured = getFeaturedHostels(response.data);
        
        setForYouHostels(forYou);
        setFeaturedHostels(featured);
        
      } else {
        setError(response.message || 'Failed to fetch hostels');
      }
    } catch (err: any) {
      console.error('Error fetching hostels:', err);
      setError('Failed to load hostels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHostelsByArea = async (areaName: string) => {
    try {
      setLoadingLocationData(true);
      
      const response = await LocationService.searchHostelsByArea(areaName);
      
      if (response.success && response.data && response.data.length > 0) {
        const hostelIds = response.data.map((result: any) => result.hostelId);
        const detailedHostels = [];
        
        for (const hostelId of hostelIds) {
          try {
            const hostelDetail = await HostelService.getHostelById(hostelId);
            if (hostelDetail.success && hostelDetail.data) {
              detailedHostels.push(hostelDetail.data);
            }
          } catch (error) {
            console.error(`Error fetching hostel ${hostelId}:`, error);
          }
        }
        
        if (detailedHostels.length > 0) {
          setAreaHostels(detailedHostels);
          setHostelsToShow(detailedHostels);
          return detailedHostels;
        }
      }
      
      const filtered = allHostels.filter(hostel => 
        hostel.location?.toLowerCase().includes(areaName.toLowerCase()) ||
        hostel.address?.toLowerCase().includes(areaName.toLowerCase()) ||
        hostel.city?.toLowerCase().includes(areaName.toLowerCase())
      );
      
      setAreaHostels(filtered);
      setHostelsToShow(filtered);
      return filtered;
      
    } catch (error) {
      console.error(`Error fetching hostels for ${areaName}:`, error);
      const filtered = allHostels.filter(hostel => 
        hostel.location?.toLowerCase().includes(areaName.toLowerCase()) ||
        hostel.address?.toLowerCase().includes(areaName.toLowerCase())
      );
      setHostelsToShow(filtered);
      setAreaHostels(filtered);
      return filtered;
    } finally {
      setLoadingLocationData(false);
    }
  };

  // FIX: Renamed to be more clear - only fetches nearby hostels
  const fetchNearbyHostelsExplicitly = async () => {
    try {
      setLoadingLocationData(true);
      
      // First get user location
      const location = await getUserLocation(true);
      
      if (location) {
        const response = await LocationService.getNearbyHostels(
          location.latitude,
          location.longitude,
          10
        );
        
        if (response.success && response.data) {
          setLocationHostels(response.data);
          setHostelsToShow(response.data);
        } else {
          // Fallback to all hostels
          setHostelsToShow(allHostels);
        }
      } else {
        // If location permission denied or failed, show all hostels
        setHostelsToShow(allHostels);
      }
    } catch (error) {
      console.error("Error fetching nearby hostels:", error);
      setHostelsToShow(allHostels);
    } finally {
      setLoadingLocationData(false);
    }
  };

  const fetchNearbyHostelsByCoordinates = async (latitude: number, longitude: number) => {
    try {
      setLoadingLocationData(true);
      
      const response = await LocationService.getNearbyHostels(
        latitude,
        longitude,
        5
      );
      
      if (response.success && response.data) {
        setLocationHostels(response.data);
        setHostelsToShow(response.data);
      } else {
        const filtered = allHostels;
        setHostelsToShow(filtered);
      }
    } catch (error) {
      console.error("Error fetching nearby hostels by coordinates:", error);
      setHostelsToShow(allHostels);
    } finally {
      setLoadingLocationData(false);
    }
  };

  // FIX: Cleaner location selection handler
  const handleLocationSelect = async (locationKey: string) => {
    // Clear any previous selection
    const prevSelected = selectedLocationKey;
    setSelectedLocationKey(locationKey);
    setLoadingLocationData(true);
    
    try {
      if (locationKey === "nearby") {
        await fetchNearbyHostelsExplicitly();
      } else {
        const selectedLocation = locations.find(loc => loc.key === locationKey);
        if (selectedLocation) {
          if (selectedLocation.coordinates) {
            // Fetch hostels by coordinates for the selected area
            await fetchNearbyHostelsByCoordinates(
              selectedLocation.coordinates.latitude,
              selectedLocation.coordinates.longitude
            );
          } else {
            // Fallback to area name search
            await fetchHostelsByArea(selectedLocation.area);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleLocationSelect:", error);
      // Revert to previous selection
      setSelectedLocationKey(prevSelected);
      setHostelsToShow(allHostels);
    } finally {
      setLoadingLocationData(false);
    }
  };

  // FIX: Initialize without automatic nearby selection
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Only fetch all hostels and user data
        await fetchAllHostels();
        await fetchUserData();
        
        const token = await AsyncStorage.getItem('accessToken');
        if (token && auth.isAuthenticated) {
          await fetchReferralData();
        }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [auth.referralData])
  );

  useEffect(() => {
    if (auth.referralData) {
      setReferralCode(auth.referralData.referralCode || "FYNDOM250");
      setReferralStats({
        totalEarned: auth.referralData.referralPoints || 0,
        successfulReferrals: auth.referralData.referralCount || 0,
        pendingReferrals: 0
      });
    }
  }, [auth.referralData]);

  useEffect(() => {
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

  // FIX: Updated filtering logic
  useEffect(() => {
    let filtered = allHostels;
    
    // Only apply location filter if a location is selected
    if (selectedLocationKey === "nearby") {
      filtered = locationHostels.length > 0 ? locationHostels : allHostels;
    } else if (selectedLocationKey && areaHostels.length > 0) {
      filtered = areaHostels;
    }

    if (searchText.trim().length > 0) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (h) => h.name?.toLowerCase().includes(lowerSearch) || 
               h.location?.toLowerCase().includes(lowerSearch) ||
               h.address?.toLowerCase().includes(lowerSearch) ||
               h.city?.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedAmenities.length > 0)
      filtered = filtered.filter((h) => selectedAmenities.every((a) => h.facilities?.includes(a)));

    if (selectedSharingTypes.length > 0) filtered = filtered.filter((h) => selectedSharingTypes.includes(h.sharing));

    if (selectedGender) filtered = filtered.filter((h) => h.gender === selectedGender);

    filtered = filtered.filter((h) => {
      const priceNum = h.startingPrice || 0;
      return priceNum <= maxPrice;
    });

    setFilteredHostels(filtered);
    
    // Update "For You" and "Featured" sections
    const forYou = getForYouHostels(filtered);
    const featured = getFeaturedHostels(filtered);
    
    setForYouHostels(forYou);
    setFeaturedHostels(featured);
    
  }, [searchText, selectedAmenities, selectedSharingTypes, selectedGender, maxPrice, allHostels, locationHostels, areaHostels, selectedLocationKey]);

  // FIX: Add clear location selection
  const clearLocationSelection = () => {
    setSelectedLocationKey("");
    setHostelsToShow(allHostels);
    setLocationHostels([]);
    setAreaHostels([]);
  };

  const toggleAmenity = (item: string) => {
    setSelectedAmenities(selectedAmenities.includes(item) ? 
      selectedAmenities.filter((a) => a !== item) : 
      [...selectedAmenities, item]
    );
  };

  const toggleSharingType = (sharing: number) => {
    setSelectedSharingTypes(selectedSharingTypes.includes(sharing) ? 
      selectedSharingTypes.filter((r) => r !== sharing) : 
      [...selectedSharingTypes, sharing]
    );
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

  const clearAllFilters = () => {
    setSelectedAmenities([]);
    setSelectedSharingTypes([]);
    setSelectedGender("");
    setMaxPrice(20000);
    setPriceInput("20000");
    clearLocationSelection();
  };

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
        clearLocationSelection();
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

🔑 Referral Code: ${referralCode}

Download Fyndom Now: https://fyndom.app/download`;

      await Share.share({
        message,
        title: 'Join Fyndom - Get ₹250 OFF!'
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share the referral message");
    }
  };

  const copyReferralCode = () => {
    Alert.alert(
      "Referral Code Copied!",
      `Code: ${referralCode}\n\nShare this code with your friends to earn rewards!`
    );
  };

  const handleBannerScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setCurrentBannerIndex(pageNum);
  };

  const renderBannerItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.bannerCard}>
      <Image source={item.img} style={styles.bannerImg} />
    </View>
  );

  const renderHostelCard = ({ item }: any) => (
    <View style={styles.featuredCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.featuredImg} />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="home-outline" size={40} color="#ccc" />
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}
      <View style={styles.featuredContent}>
        <Text style={styles.featuredName}>{item.name}</Text>
        <Text style={styles.featuredLoc}>
          {item.location} • ₹{item.startingPrice || item.price}
        </Text>
        <Text style={styles.featuredAddress} numberOfLines={1}>
          {item.address || ""}
        </Text>
        <Text style={styles.featuredRating}>⭐ {item.rating?.toFixed(1) || '4.0'}</Text>

        <View style={styles.availabilityRow}>
          {item.availableSharingTypes?.includes(1) && (
            <View style={styles.availabilityTag}>
              <Text style={styles.availabilityText}>1</Text>
            </View>
          )}
          {item.availableSharingTypes?.includes(2) && (
            <View style={styles.availabilityTag}>
              <Text style={styles.availabilityText}>2</Text>
            </View>
          )}
          {item.availableSharingTypes?.includes(3) && (
            <View style={styles.availabilityTag}>
              <Text style={styles.availabilityText}>3</Text>
            </View>
          )}
          {item.availableSharingTypes?.includes(4) && (
            <View style={styles.availabilityTag}>
              <Text style={styles.availabilityText}>4</Text>
            </View>
          )}
        </View>

        <View style={styles.facilitiesRow}>
          {item.facilities?.slice(0, 3).map((f: string, i: number) => (
            <View key={i} style={styles.facilityTag}>
              <Text style={styles.facilityText}>{f}</Text>
            </View>
          ))}
          {item.facilities?.length > 3 && (
            <View style={styles.facilityTag}>
              <Text style={styles.facilityText}>+{item.facilities.length - 3}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.featuredBtn}
          onPress={() => router.push({
            pathname: "/HostelDetails",
            params: {
              hostel: JSON.stringify({
                ...item,
                hostelOwnerId: item.hostelOwnerId || item.id || item._id,
                hostelId: item.id || item._id
              })
            }
          })}
        >
          <Text style={styles.featuredBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLocationItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.locationItem, selectedLocationKey === item.key && styles.locationItemSelected]}
      onPress={() => handleLocationSelect(item.key)}
      activeOpacity={0.7}
      disabled={loadingLocationData}
    >
      <View style={styles.locationCircle}>
        <Image source={item.icon} style={styles.locationIcon} resizeMode="cover" />
        {selectedLocationKey === item.key && loadingLocationData && (
          <View style={styles.locationLoadingOverlay}>
            <ActivityIndicator size="small" color="#219150" />
          </View>
        )}
      </View>
      <Text style={[
        styles.locationLabel,
        selectedLocationKey === item.key && styles.locationLabelSelected
      ]}>
        {item.label}
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

  const renderFilterChips = () => {
    const hasLocationFilter = selectedLocationKey !== "";

    if (!hasActiveFilters && !hasLocationFilter) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
        >
          {hasLocationFilter && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {locations.find(loc => loc.key === selectedLocationKey)?.label || 'Location'}
              </Text>
              <TouchableOpacity
                onPress={() => removeFilter('location')}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color="#219150" />
              </TouchableOpacity>
            </View>
          )}

          {maxPrice < 20000 && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Price: Up to ₹{maxPrice}</Text>
              <TouchableOpacity
                onPress={() => removeFilter('price')}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color="#219150" />
              </TouchableOpacity>
            </View>
          )}

          {selectedGender && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Gender: {selectedGender}</Text>
              <TouchableOpacity
                onPress={() => removeFilter('gender')}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color="#219150" />
              </TouchableOpacity>
            </View>
          )}

          {selectedSharingTypes.map((sharing) => (
            <View key={`sharing-${sharing}`} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{sharing} Sharing</Text>
              <TouchableOpacity
                onPress={() => removeFilter('sharing', sharing)}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color="#219150" />
              </TouchableOpacity>
            </View>
          ))}

          {selectedAmenities.map((amenity) => (
            <View key={`amenity-${amenity}`} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{amenity}</Text>
              <TouchableOpacity
                onPress={() => removeFilter('amenity', amenity)}
                style={styles.filterChipClose}
              >
                <Ionicons name="close" size={16} color="#219150" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={() => removeFilter('all')}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const isLoading = loading || userLoading;

  if (isLoading && allHostels.length === 0) {
    return (
      <SafeAreaView style={styles.pageBg}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#219150" />
          <Text style={styles.loadingText}>
            {locationLoading ? "Detecting location..." : "Loading hostels..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && allHostels.length === 0) {
    return (
      <SafeAreaView style={styles.pageBg}>
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-off" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchAllHostels}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const boysHostels = hostelsToShow.filter((h) => h.gender === "Boys" || h.gender === "boys" || h.hostelType === "boys");
  const girlsHostels = hostelsToShow.filter((h) => h.gender === "Girls" || h.gender === "girls" || h.hostelType === "girls");

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {banners.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentBannerIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.pageBg} edges={[]}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={{ ...styles.scrollAll, paddingTop: 0 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.cardRow}>
            <Image source={require("../../assets/logo.png")} style={styles.logoLarge} />
            <View style={styles.headerRightActions}>
              <TouchableOpacity onPress={() => router.push("/Notifications")} style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={27} color="#222831" style={{ marginRight: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await fetchUserData();
                  router.push("/Profile");
                }}
                style={styles.iconButton}
              >
                <Ionicons name="person-circle-outline" size={27} color="#222831" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#000" />
            <Text style={styles.locationDetectText}>
              {locationLoading ? "Detecting location..." : detectedLocation || "Tap location icon to detect"}
            </Text>
            {!detectedLocation && (
              <TouchableOpacity 
                onPress={() => getUserLocation(false)} 
                style={styles.locationRefreshButton}
              >
                <Ionicons name="refresh" size={16} color="#219150" />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.welcomeText}>
            {timeGreeting},{"\n"}
            {userName}
          </Text>
          
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={20} color="#555" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search hostels, areas..."
              placeholderTextColor="#aaa"
              style={styles.searchInputSmall}
              returnKeyType="search"
              onSubmitEditing={onSearchPress}
            />
            <TouchableOpacity onPress={onSearchPress} style={{ paddingHorizontal: 6 }}>
              <Ionicons name="arrow-forward-circle-outline" size={24} color="#219150" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <Ionicons
                name="options-outline"
                size={20}
                color={hasActiveFilters || selectedLocationKey !== "" ? "#219150" : "#555"}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {renderFilterChips()}

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

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>For You</Text>
          <TouchableOpacity onPress={() => handleSeeAll('forYou')}>
            <Text style={styles.seeAllBtn}>See All ▸</Text>
          </TouchableOpacity>
        </View>
        {forYouHostels.length > 0 ? (
          <FlatList
            data={forYouHostels}
            renderItem={renderHostelCard}
            keyExtractor={(item) => "foryou-" + (item.id || item._id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListRow}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hostels match your preferences</Text>
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured Hostels</Text>
          <TouchableOpacity onPress={() => handleSeeAll('featured')}>
            <Text style={styles.seeAllBtn}>See All ▸</Text>
          </TouchableOpacity>
        </View>
        {featuredHostels.length > 0 ? (
          <FlatList
            data={featuredHostels}
            renderItem={renderHostelCard}
            keyExtractor={(item) => "featured-" + (item.id || item._id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.flatListRow}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No featured hostels available</Text>
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Offers for You</Text>
          <TouchableOpacity onPress={handleSeeAll}>
            <Text style={styles.seeAllBtn}>See All ▸</Text>
          </TouchableOpacity>
        </View>
        <FlatList 
          data={offers} 
          renderItem={({ item }) => (
            <View style={styles.offerRectCard}>
              <Image source={item.icon} style={styles.offerRectIcon} resizeMode="contain" />
              <Text style={styles.offerRectTitle}>{item.title}</Text>
            </View>
          )} 
          keyExtractor={(_, i) => "offer" + i} 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingLeft: 12, paddingVertical: 14 }} 
        />

        <Text style={styles.sectionTitle}>Refer & Win</Text>
        <FlatList 
          data={referCards} 
          renderItem={({ item }) => (
            <ImageBackground source={item.bgImage} style={styles.referCardBg} imageStyle={styles.referCardImageStyle}>
              <View style={styles.referOverlay} />
              <View style={styles.referIconContainer}>
                <Ionicons name={item.icon as any} size={36} color="#FFD600" />
              </View>
              <View style={styles.referTextContainer}>
                <Text style={styles.referTitle}>{item.title}</Text>
                <Text style={styles.referDesc}>{item.desc}</Text>
              </View>
            </ImageBackground>
          )} 
          keyExtractor={(_, i) => "refer" + i} 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.flatListRow} 
          contentContainerStyle={{ paddingLeft: 12, paddingVertical: 14 }} 
        />

        <Text style={styles.sectionTitle}>Boys Hostels</Text>
        {boysHostels.length > 0 ? (
          <FlatList data={boysHostels} renderItem={renderHostelCard} keyExtractor={(item) => "boy-" + (item.id || item._id)} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No boys hostels available</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Girls Hostels</Text>
        {girlsHostels.length > 0 ? (
          <FlatList data={girlsHostels} renderItem={renderHostelCard} keyExtractor={(item) => "girl-" + (item.id || item._id)} horizontal showsHorizontalScrollIndicator={false} style={styles.flatListRow} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No girls hostels available</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={filterVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={() => setFilterVisible(false)}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
          </TouchableWithoutFeedback>
          <View style={styles.filterModalContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              
              <Text style={styles.filterSectionTitle}>Amenities</Text>
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
                          borderColor: selectedAmenities.includes(item) ? "#ffffffff" : "#9e9e9e",
                          backgroundColor: selectedAmenities.includes(item) ? "#ffffffff" : "transparent",
                        },
                      ]}
                    >
                      {selectedAmenities.includes(item) && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={styles.filterOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Max Price</Text>
              <TextInput
                value={priceInput}
                onChangeText={(val) => setPriceInput(val.replace(/\D/g, ""))}
                placeholder="Max Price"
                keyboardType="numeric"
                style={styles.priceInput}
                maxLength={6}
              />
              
              <Text style={styles.filterSectionTitle}>Sharing</Text>
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
                          borderColor: selectedSharingTypes.includes(sharing) ? "#f2f2f2ff" : "#9e9e9e",
                          backgroundColor: selectedSharingTypes.includes(sharing) ? "#ffffffff" : "transparent",
                        },
                      ]}
                    >
                      {selectedSharingTypes.includes(sharing) && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={styles.filterOptionText}>{sharing} Sharing</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Gender</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {genderOptions.map((gender, i) => (
                  <TouchableOpacity key={i} style={{ flexDirection: "row", alignItems: "center", width: "33%", marginVertical: 6 }} onPress={() => toggleGender(gender)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: selectedGender === gender ? "#fcfcfcff" : "#9e9e9e",
                          backgroundColor: selectedGender === gender ? "#fffefeff" : "transparent",
                        },
                      ]}
                    >
                      {selectedGender === gender && <View style={styles.checkboxInner} />}
                    </View>
                    <Text style={styles.filterOptionText}>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelFilters}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
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
  pageBg: { flex: 1, backgroundColor: "#fff", paddingTop: 0 },
  scrollAll: { paddingBottom: 22 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#219150',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#219150',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: "#fdfde7ff",
    paddingHorizontal: 12,
    paddingBottom: 15,
    paddingTop: 10,
  },
  cardRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 0, 
    marginTop: 0 
  },
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
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    marginBottom: 8,
    marginTop: -15,
  },
  locationDetectText: { 
    fontSize: 16, 
    fontWeight: "normal", 
    color: "#000000", 
    marginLeft: 6 
  },
  locationRefreshButton: {
    marginLeft: 8,
    padding: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#219150",
    marginBottom: 6,
    marginTop: 0,
    textAlign: "left",
    marginLeft: 4,
  },
  searchWrap: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#ffffffff", 
    borderRadius: 14, 
    paddingHorizontal: 10, 
    height: 40, 
    marginTop: 6 
  },
  searchInputSmall: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 16, 
    color: "#222831", 
    height: 38 
  },
  locationsContainer: { 
    marginTop: 12, 
    paddingLeft: 12, 
    paddingBottom: 6 
  },
  locationItem: { 
    alignItems: "center", 
    marginRight: 16,
    position: 'relative' 
  },
  locationCircle: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: "#feffffff", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 6, 
    overflow: "hidden",
    position: 'relative'
  },
  locationIcon: { 
    width: "100%", 
    height: "100%", 
    borderRadius: 28 
  },
  locationLabel: { 
    fontSize: 12, 
    color: "#0e0f0fff", 
    fontWeight: "600", 
    textAlign: "center", 
    width: 70 
  },
  locationItemSelected: {
    borderWidth: 2,
    borderColor: "#219150",
    borderRadius: 30,
    padding: 2,
  },
  locationLabelSelected: {
    color: '#219150',
    fontWeight: '700',
  },
  locationLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    backgroundColor: '#219150',
    width: 20,
  },
  paginationDotInactive: {
    backgroundColor: '#ccc',
  },
  sectionRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 10, 
    marginHorizontal: 12 
  },
  sectionTitle: { 
    fontWeight: "bold", 
    fontSize: 18, 
    color: "#222831", 
    marginVertical: 8, 
    marginLeft: 12 
  },
  seeAllBtn: { 
    fontSize: 13, 
    color: "#219150", 
    fontWeight: "700", 
    paddingHorizontal: 6 
  },
  flatListRow: { 
    marginVertical: 7, 
    minHeight: 110, 
    paddingLeft: 10 
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: width * 0.6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#222",
    shadowOpacity: 0.06,
    elevation: 3,
    padding: 10,
  },
  featuredImg: { 
    width: "100%", 
    height: 120, 
    borderRadius: 8, 
    marginBottom: 6 
  },
  noImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  featuredContent: { 
    flex: 1, 
    justifyContent: "space-between" 
  },
  featuredName: { 
    fontWeight: "bold", 
    fontSize: 14, 
    color: "#222831" 
  },
  featuredLoc: { 
    fontSize: 12, 
    color: "#3a6351", 
    marginVertical: 3 
  },
  featuredAddress: { 
    fontSize: 11, 
    color: "#636363", 
    marginBottom: 2, 
    fontWeight: "600", 
    width: "100%" 
  },
  featuredRating: { 
    fontSize: 12, 
    color: "#ff7b54", 
    marginVertical: 2 
  },
  availabilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  availabilityTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 10,
    color: '#1976d2',
    fontWeight: '600',
  },
  facilitiesRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    alignItems: "center" 
  },
  facilityTag: { 
    backgroundColor: "#c7e47e", 
    borderRadius: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    marginRight: 6, 
    marginTop: 6 
  },
  facilityText: { 
    color: "#155a46", 
    fontWeight: "700", 
    fontSize: 12 
  },
  featuredBtn: { 
    backgroundColor: "#219150", 
    borderRadius: 8, 
    marginTop: 6, 
    paddingVertical: 6, 
    alignItems: "center" 
  },
  featuredBtnText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 12 
  },
  offerRectCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    width: width * 0.8,
    height: 110,
    marginRight: 20,
    alignItems: "center",
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  offerRectIcon: { 
    width: 80, 
    height: 80, 
    borderRadius: 14, 
    marginRight: 28 
  },
  offerRectTitle: { 
    fontWeight: "bold", 
    fontSize: 16, 
    color: "#000000", 
    flexShrink: 1 
  },
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
  referCardImageStyle: { 
    borderRadius: 18, 
    resizeMode: "cover" 
  },
  referOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 18,
  },
  referIconContainer: { 
    marginRight: 20, 
    zIndex: 10 
  },
  referTextContainer: { 
    flex: 1, 
    zIndex: 10 
  },
  referTitle: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  referDesc: { 
    fontSize: 16, 
    color: "#f3f3f3", 
    marginTop: 6 
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
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
    backgroundColor: '#f1f8e9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#219150',
  },
  filterChipText: {
    fontSize: 12,
    color: '#219150',
    fontWeight: '600',
    marginRight: 4,
  },
  filterChipClose: {
    padding: 2,
  },
  clearAllButton: {
    backgroundColor: '#ff6b6b',
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
  filterModalContent: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: height * 0.75,
    minHeight: height * 0.4,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  filterModalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 14, 
    color: "#25c405ff" 
  },
  filterSectionTitle: { 
    fontSize: 15, 
    fontWeight: "700", 
    marginBottom: 8, 
    color: "#04a00cff" 
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderRadius: 5, 
    borderWidth: 2, 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 10 
  },
  checkboxInner: { 
    width: 12, 
    height: 12, 
    backgroundColor: "#19a007ff", 
    borderRadius: 3 
  },
  filterOptionText: { 
    fontSize: 13, 
    color: "#d7ce27ff" 
  },
  priceInput: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 16, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    marginBottom: 14, 
    fontSize: 13, 
    width: "100%" 
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: "#a1a1aa", 
    paddingVertical: 7, 
    borderRadius: 9, 
    alignItems: "center", 
    marginRight: 8 
  },
  applyBtn: { 
    flex: 1, 
    backgroundColor: "#5a5c09ff", 
    paddingVertical: 7, 
    borderRadius: 9, 
    alignItems: "center", 
    marginLeft: 8 
  },
});