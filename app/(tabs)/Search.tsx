// app/SearchPage.tsx
import { useThemeContext } from "@/components/ui/ThemeContext";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import HostelService, { Hostel } from "../api/HostelService";

const { width } = Dimensions.get("window");

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [hostels, setHostels] = useState<any[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const { isDark } = useThemeContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { query } = useLocalSearchParams(); 

  useEffect(() => {
    if (query) {
      setKeyword(query as string);
      handleSearch(query as string);
    }
  }, [query]);

  const theme = isDark
    ? {
        background: "#000000",
        cardBackground: "#121212",
        text: "#EEEEEE",
        headerText: "#A5D6A7",
        accent: "#4CAF50",
        shadow: "#000000",
        border: "#333333",
        searchBackground: "#2c2c2c",
      }
    : {
        background: "#FFFFFF",
        cardBackground: "#F5F5F5",
        text: "#222222",
        headerText: "#1E3A1E",
        accent: "#4CAF50",
        shadow: "#CCCCCC",
        border: "#E0E0E0",
        searchBackground: "#fff",
      };

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Back navigation error:", err);
      router.push("/");
    }
  };

  // Transform API hostel data to frontend format
  const transformHostelData = (hostel: Hostel) => {
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

    // Calculate starting price from available room types
    let startingPrice = hostel.startingPrice || 0;
    if (startingPrice === 0 || startingPrice === null) {
      const prices = [
        hostel.pricing?.single?.monthly?.price,
        hostel.pricing?.double?.monthly?.price,
        hostel.pricing?.triple?.monthly?.price,
        hostel.pricing?.four?.monthly?.price
      ].filter(price => price !== null && price !== undefined && price > 0) as number[];
      
      if (prices.length > 0) {
        startingPrice = Math.min(...prices);
      }
    }

    // Calculate rating based on facilities and availability
    const baseRating = 3.5;
    let ratingBonus = 0;

    if (hostel.photos?.length > 0) ratingBonus += 0.3;
    
    const facilitiesCount = hostel.facilities?.essentials?.length || 0;
    ratingBonus += Math.min(facilitiesCount * 0.1, 0.5);
    
    if (hostel.facilities?.essentials?.includes('Air Conditioning')) ratingBonus += 0.2;
    if (hostel.facilities?.essentials?.includes('Free WiFi')) ratingBonus += 0.2;

    const finalRating = Math.min(baseRating + ratingBonus + (Math.random() * 0.6), 5.0);

    // Extract location from address
    const extractLocationFromAddress = (address: string): string => {
      if (!address) return 'Unknown Location';

      const areas = [
        'Kukatpally', 'L.B. Nagar', 'Secunderabad', 'Ameerpet',
        'Hitech City', 'Madhapur', 'Begumpet', 'KPHB', 'Dilsukhnagar',
        'Hyderabad', 'Bangalore', 'Karnataka', 'Telangana'
      ];

      for (const area of areas) {
        if (address.toLowerCase().includes(area.toLowerCase())) {
          return area;
        }
      }

      const words = address.split(',').map(word => word.trim()).filter(word => word.length > 3);
      return words[0] || 'Unknown Location';
    };

    // Determine gender from hostel data
    const determineGenderFromHostel = (hostel: Hostel): string => {
      const name = hostel.hostelName?.toLowerCase() || '';
      const type = hostel.hostelType?.toLowerCase() || '';

      if (name.includes('boys') || name.includes('boy') || type === 'boys') return 'Boys';
      if (name.includes('girls') || name.includes('girl') || type === 'girls') return 'Girls';
      if (name.includes('women') || name.includes('womens')) return 'Girls';
      return 'Co-living';
    };

    return {
      id: hostel._id,
      name: hostel.hostelName || 'Unnamed Hostel',
      address: hostel.address || 'Address not provided',
      price: startingPrice > 0 ? `₹${startingPrice} / month` : 'Price not available',
      location: extractLocationFromAddress(hostel.address),
      rating: parseFloat(finalRating.toFixed(1)),
      image: imageUrl,
      facilities: hostel.facilities?.essentials || [],
      gender: determineGenderFromHostel(hostel),
      summary: hostel.summary || 'Comfortable accommodation with modern amenities.',
      contact: hostel.contact || 'Not provided',
      email: hostel.email || 'Not provided',
      coordinates: hostel.coordinates,
      allPhotos: hostel.photos || [],
      allFacilities: hostel.facilities || {},
      pricing: hostel.pricing || {},
      availabilitySummary: hostel.availabilitySummary || {},
      distance: hostel.distance,
      isNearby: hostel.isNearby,
      rawData: hostel
    };
  };

  const handleSearch = async (searchText?: string) => {
    const searchQuery = searchText || keyword;
    
    if (!searchQuery.trim()) {
      Alert.alert("Please enter search text");
      return;
    }

    setLoadingSearch(true);
    try {
      const response = await HostelService.searchHostels(searchQuery);
      
      if (response.success) {
        const transformedHostels = response.data.map(hostel => transformHostelData(hostel));
        setHostels(transformedHostels);
      } else {
        Alert.alert("Search Failed", response.message || "No hostels found");
        setHostels([]);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search hostels. Please try again.");
      setHostels([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const fetchNearbyHostels = async () => {
    setLoadingNearby(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Location Permission Denied", "Please enable location services to find nearby hostels.");
        setLoadingNearby(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Try multiple search distances
      const searchDistances = [10, 20, 50];
      let nearbyHostels: Hostel[] = [];
      
      for (const distance of searchDistances) {
        try {
          const response = await HostelService.getNearbyHostels(latitude, longitude, distance);
          
          if (response.success && response.data && response.data.length > 0) {
            nearbyHostels = response.data;
            break;
          }
        } catch (error) {
          console.error(`Error with ${distance}km search:`, error);
        }
      }

      if (nearbyHostels.length > 0) {
        const transformedHostels = nearbyHostels.map(hostel => transformHostelData(hostel));
        setHostels(transformedHostels);
      } else {
        // Fallback to area-based search
        try {
          const address = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (address && address.length > 0) {
            const area = address[0].district || address[0].subregion || address[0].city;
            if (area) {
              const response = await HostelService.searchHostels(area);
              if (response.success && response.data.length > 0) {
                const transformedHostels = response.data.map(hostel => transformHostelData(hostel));
                setHostels(transformedHostels);
                Alert.alert("Area Search", `Found ${transformedHostels.length} hostels in ${area}`);
                return;
              }
            }
          }
        } catch (areaError) {
          console.error('Area search error:', areaError);
        }
        
        Alert.alert(
          "No Nearby Hostels", 
          "No hostels found in your area. Try searching with specific area names like 'KPHB', 'Hitech City', etc."
        );
        setHostels([]);
      }
    } catch (error: any) {
      console.error("Nearby search error:", error);
      Alert.alert(
        "Error", 
        `Failed to find nearby hostels: ${error.response?.data?.message || error.message}`
      );
      setHostels([]);
    } finally {
      setLoadingNearby(false);
    }
  };

  const renderHostel = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.hostelCard,
        {
          backgroundColor: theme.cardBackground,
          shadowColor: theme.shadow,
          borderColor: theme.border,
        },
      ]}
      activeOpacity={0.8}
      onPress={() => router.push({ 
        pathname: "/HostelDetails", 
        params: { hostel: JSON.stringify(item) } 
      })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.hostelImage} resizeMode="cover" />
      ) : (
        <View style={[styles.hostelImage, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="home-outline" size={40} color="#999" />
        </View>
      )}
      <View style={{ padding: 12 }}>
        <Text style={[styles.hostelName, { color: theme.headerText }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.hostelArea, { color: theme.text }]} numberOfLines={1}>{item.location}</Text>
        <Text style={[styles.hostelPrice, { color: theme.accent }]}>{item.price}</Text>
        <Text style={[styles.hostelRating, { color: theme.text }]}>⭐ {item.rating}</Text>
        
        {item.distance !== undefined && (
          <Text style={[styles.hostelDistance, { color: theme.text }]}>
            📍 {item.distance.toFixed(1)} km away
          </Text>
        )}

        <View style={styles.availabilityRow}>
          {item.availabilitySummary?.single?.availableBeds > 0 && (
            <Text style={[styles.availabilityText, { color: theme.accent }]}>
              1-share: {item.availabilitySummary.single.availableBeds}
            </Text>
          )}
          {item.availabilitySummary?.double?.availableBeds > 0 && (
            <Text style={[styles.availabilityText, { color: theme.accent }]}>
              2-share: {item.availabilitySummary.double.availableBeds}
            </Text>
          )}
          {item.availabilitySummary?.triple?.availableBeds > 0 && (
            <Text style={[styles.availabilityText, { color: theme.accent }]}>
              3-share: {item.availabilitySummary.triple.availableBeds}
            </Text>
          )}
          {item.availabilitySummary?.four?.availableBeds > 0 && (
            <Text style={[styles.availabilityText, { color: theme.accent }]}>
              4-share: {item.availabilitySummary.four.availableBeds}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.viewBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push({ 
            pathname: "/HostelDetails", 
            params: { hostel: JSON.stringify(item) } 
          })}
        >
          <Text style={styles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const showCenteredSearchIcon = hostels.length === 0 && !loadingNearby && !loadingSearch;
  const showLoading = loadingNearby || loadingSearch;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
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
          🔍 Search Hostels
        </Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={[styles.searchBox, { 
          borderColor: theme.accent, 
          backgroundColor: theme.searchBackground 
        }]}>
          <Icon name="magnify" size={20} color={theme.accent} style={{ marginRight: 6 }} />
          <TextInput
            placeholder="Search hostels, areas, etc."
            placeholderTextColor={isDark ? "#aaa" : "#888"}
            style={[styles.searchInput, { color: theme.text }]}
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={{ paddingHorizontal: 8 }}>
            <Icon name="filter-variant" size={24} color={theme.accent} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.nearbyBtn, loadingNearby && styles.nearbyBtnDisabled]}
          onPress={fetchNearbyHostels}
          accessibilityLabel="Detect nearby hostels"
          disabled={loadingNearby}
        >
          {loadingNearby ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <Icon name="crosshairs-gps" size={28} color={theme.accent} />
          )}
          <Text style={[styles.nearbyText, { color: theme.text }]}>
            {loadingNearby ? "Searching..." : "Nearby Hostels"}
          </Text>
        </TouchableOpacity>

        {showLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              {loadingNearby ? "Finding nearby hostels..." : "Searching hostels..."}
            </Text>
          </View>
        )}

        {showCenteredSearchIcon && (
          <View style={styles.centeredSearchIconContainer}>
            <Icon name="magnify" size={100} color={theme.accent} />
            <Text style={[styles.centeredText, { color: theme.text }]}>
              Search for hostels or tap the nearby button
            </Text>
          </View>
        )}

        {hostels.length > 0 && (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsText, { color: theme.text }]}>
              Found {hostels.length} hostels
            </Text>
          </View>
        )}

        {hostels.length > 0 && (
          <FlatList
            data={hostels}
            keyExtractor={(item) => item.id}
            renderItem={renderHostel}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {hostels.length === 0 && !showLoading && !showCenteredSearchIcon && (
          <View style={styles.noResultsContainer}>
            <Icon name="emoticon-sad-outline" size={80} color={theme.accent} />
            <Text style={[styles.noResultsText, { color: theme.text }]}>
              No hostels found
            </Text>
            <Text style={[styles.noResultsSubText, { color: theme.text }]}>
              Try different search terms or use nearby search
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    height: 80,
  },
  backButton: {
    paddingRight: 12,
    zIndex: 10,
  },
  heading: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  nearbyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  nearbyBtnDisabled: {
    opacity: 0.6,
  },
  nearbyText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  centeredSearchIconContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  centeredText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  hostelCard: {
    borderRadius: 16,
    width: (width - 48) / 2,
    overflow: "hidden",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
  },
  hostelImage: { 
    width: "100%", 
    height: 100, 
  },
  hostelName: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 2 
  },
  hostelArea: { 
    fontSize: 12, 
    marginBottom: 4,
    opacity: 0.8 
  },
  hostelPrice: { 
    fontSize: 12, 
    fontWeight: "600",
    marginBottom: 2 
  },
  hostelRating: { 
    fontSize: 12, 
    marginBottom: 4 
  },
  hostelDistance: {
    fontSize: 11,
    marginBottom: 4,
    opacity: 0.8,
  },
  availabilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 10,
    marginRight: 8,
    marginBottom: 2,
  },
  viewBtn: { 
    paddingVertical: 6, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  viewBtnText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 12 
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  noResultsSubText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
});