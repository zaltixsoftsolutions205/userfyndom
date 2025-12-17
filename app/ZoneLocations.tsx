import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const zones: Record<string, { name: string; icon: string }[]> = {
  "Charminar Zone": [
    { name: "Charminar", icon: "🕌" },
    { name: "Laad Bazaar", icon: "🎨" },
    { name: "Old City", icon: "🏘️" },
    { name: "Moazzam Jahi Market", icon: "🛍️" },
    { name: "Madina Building", icon: "🏢" },
    { name: "Salar Jung Museum", icon: "🏛️" },
    { name: "Purani Haveli", icon: "🏰" },
    { name: "Shalibanda", icon: "🏘️" },
    { name: "Falaknuma", icon: "🏰" },
    { name: "Afzalgunj", icon: "🏢" },
    { name: "Malakpet", icon: "🏘️" },
    { name: "Yakutpura", icon: "🏘️" },
    { name: "Dabeerpura", icon: "🏘️" },
    { name: "Chaderghat", icon: "🏘️" },
    { name: "Asifnagar", icon: "🏘️" },
    { name: "Shah Ali Banda", icon: "🏘️" },
    { name: "Ramnagar", icon: "🏘️" },
    { name: "Sultan Bazaar", icon: "🛍️" },
  ],
  "L.B. Nagar Zone": [
    { name: "L.B. Nagar", icon: "🚌" },
    { name: "Dilsukhnagar", icon: "🏬" },
    { name: "Hayathnagar", icon: "🏘️" },
    { name: "Vanasthalipuram", icon: "🏘️" },
    { name: "Nagole", icon: "🏘️" },
    { name: "Uppal", icon: "🏘️" },
    { name: "LB Nagar Industrial Area", icon: "🏢" },
    { name: "Mansoorabad", icon: "🏘️" },
    { name: "Saroornagar", icon: "🏘️" },
    { name: "Habsiguda", icon: "🏘️" },
    { name: "Kothapet", icon: "🏘️" },
    { name: "Ibrahim Bagh", icon: "🏘️" },
    { name: "Hayatnagar ORR area", icon: "🏘️" },
    { name: "Cherlapally", icon: "🏘️" },
  ],
  "Kukatpally Zone": [
    { name: "Kukatpally", icon: "🎓" },
    { name: "JNTU Hyderabad", icon: "🎓" },
    { name: "Chandanagar", icon: "🏘️" },
    { name: "Miyapur", icon: "🏘️" },
    { name: "KPHB Colony", icon: "🏘️" },
    { name: "Bachupally", icon: "🏘️" },
    { name: "Nizampet", icon: "🏘️" },
    { name: "Gokul Nagar", icon: "🏘️" },
    { name: "Moosapet", icon: "🏘️" },
    { name: "Hafeezpet", icon: "🏘️" },
    { name: "Tellapur", icon: "🏘️" },
    { name: "Patancheru", icon: "🏘️" },
    { name: "Gachibowli (edges)", icon: "💻" },
    { name: "Moti Nagar", icon: "🏘️" },
    { name: "Chintal", icon: "🏘️" },
  ],
  "Serilingampally Zone": [
    { name: "Hitech City", icon: "💻" },
    { name: "Gachibowli", icon: "💻" },
    { name: "Madhapur", icon: "💻" },
    { name: "Kondapur", icon: "💻" },
    { name: "Nanakramguda", icon: "💻" },
    { name: "Manikonda", icon: "💻" },
    { name: "Financial District", icon: "💻" },
    { name: "Raidurg", icon: "💻" },
    { name: "Kokapet", icon: "💻" },
    { name: "Narsingi", icon: "💻" },
    { name: "Shamshabad", icon: "✈️" },
    { name: "Shankarpally", icon: "🏘️" },
    { name: "Kokapet ORR", icon: "💻" },
    { name: "Tellapur (edges)", icon: "💻" },
    { name: "Ferozepet", icon: "🏘️" },
  ],
  "Secunderabad Zone": [
    { name: "Secunderabad", icon: "🚆" },
    { name: "Bowenpally", icon: "🏘️" },
    { name: "Begumpet", icon: "🏘️" },
    { name: "Ameerpet", icon: "🏘️" },
    { name: "Trimulgherry", icon: "🏘️" },
    { name: "Malkajgiri", icon: "🏘️" },
    { name: "Alwal", icon: "🏘️" },
    { name: "Marredpally", icon: "🏘️" },
    { name: "Safilguda", icon: "🏘️" },
    { name: "Sainikpuri", icon: "🏘️" },
    { name: "Bolarum", icon: "🏘️" },
    { name: "Kapra", icon: "🏘️" },
    { name: "Nacharam", icon: "🏘️" },
    { name: "ECIL Cross Road", icon: "🏘️" },
    { name: "LB Nagar outskirts", icon: "🏘️" },
  ],
  "Khairatabad Zone": [
    { name: "Khairatabad", icon: "👥" },
    { name: "Somajiguda", icon: "🏘️" },
    { name: "Punjagutta", icon: "🏘️" },
    { name: "Banjara Hills", icon: "🏘️" },
    { name: "Himayatnagar", icon: "🏘️" },
    { name: "Masab Tank", icon: "🏘️" },
    { name: "A.C. Guards", icon: "🏘️" },
    { name: "Road No. 1 (Banjara Hills)", icon: "🏘️" },
    { name: "Jubilee Hills", icon: "🏘️" },
    { name: "Panjagutta Junction", icon: "🏘️" },
    { name: "Narayanguda", icon: "🏘️" },
    { name: "Abids", icon: "🏘️" },
    { name: "Somajiguda Flyover Area", icon: "🏘️" },
    { name: "Nallakunta", icon: "🏘️" },
  ],
};

export default function ZoneLocations() {
  const params = useLocalSearchParams<{ zone: string }>();
  const { zone } = params;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const locations = zone ? zones[zone] || [] : [];
  const screenWidth = Dimensions.get("window").width;

  const [showHostels, setShowHostels] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [hostels, setHostels] = useState<any[]>([]);

  const fetchHostelsForLocation = (locationName: string) => {
    const mockHostels = [
      {
        name: `${locationName} GreenView Boys Hostel`,
        price: "₹4500 / month",
        location: locationName,
        rating: 4.5,
        image: "https://picsum.photos/300/200?1",
      },
      {
        name: `${locationName} Sunrise Girls PG`,
        price: "₹6000 / month",
        location: locationName,
        rating: 4.2,
        image: "https://picsum.photos/300/200?2",
      },
      {
        name: `${locationName} Elite Residency`,
        price: "₹5500 / month",
        location: locationName,
        rating: 4.8,
        image: "https://picsum.photos/300/200?3",
      },
    ];
    setHostels(mockHostels);
    setSelectedLocation(locationName);
    setShowHostels(true);
  };

  let numColumns = 3;
  if (screenWidth <= 360) numColumns = 2;
  else if (screenWidth <= 280) numColumns = 1;
  const cardMargin = 8;
  const cardWidth = (screenWidth - 16 * 2 - cardMargin * (numColumns - 1)) / numColumns;

  const renderHostelItem = ({ item }: { item: any }) => (
    <View style={styles.nearbyCard}>
      <Image source={{ uri: item.image }} style={styles.nearbyImage} resizeMode="cover" />
      <View style={{ padding: 10 }}>
        <Text style={styles.nearbyTitle}>{item.name}</Text>
        <Text style={styles.nearbyLocation}>{item.location}</Text>
        <Text style={styles.nearbyPrice}>{item.price}</Text>
        <Text style={styles.nearbyRating}>⭐ {item.rating}</Text>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => router.push({ pathname: "/HostelDetails", params: { hostel: JSON.stringify(item) } })}
        >
          <Text style={styles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { fontSize: screenWidth > 350 ? 22 : 18 }]}>
          {selectedLocation || zone || "Zone"}
        </Text>

        {!showHostels && (
          <>
            <TouchableOpacity style={[styles.backLocationBtn, { marginBottom: 16 }]} onPress={() => router.push("/Home")}>
              <Text style={styles.backText}>← Back to Home</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
              <View style={styles.grid}>
                {locations.map((loc, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.squareCard,
                      {
                        width: cardWidth,
                        marginRight: (i + 1) % numColumns === 0 ? 0 : cardMargin,
                      },
                    ]}
                    onPress={() => fetchHostelsForLocation(loc.name)}
                  >
                    <Text style={[styles.emojiIcon, { fontSize: screenWidth > 350 ? 28 : 24 }]}>{loc.icon}</Text>
                    <Text style={[styles.cardLabel, { fontSize: screenWidth > 350 ? 12 : 10 }]}>{loc.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {showHostels && (
          <>
            <TouchableOpacity style={styles.backLocationBtn} onPress={() => setShowHostels(false)}>
              <Text style={styles.backText}>← Back to Locations</Text>
            </TouchableOpacity>
            <FlatList
              data={hostels}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderHostelItem}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, paddingHorizontal: 16 },
  title: { fontWeight: "bold", marginBottom: 16, color: "#ff7b54", textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  squareCard: {
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiIcon: { marginBottom: 4 },
  cardLabel: { fontWeight: "600", color: "#222831", textAlign: "center" },
  backLocationBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#020202ff",
    borderRadius: 20,
  },
  backText: { color: "#fff", fontWeight: "600" },
  nearbyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: (Dimensions.get("window").width - 48) / 2,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  nearbyImage: { width: "100%", height: 120, backgroundColor: "#eee" },
  nearbyTitle: { fontSize: 16, fontWeight: "bold", marginTop: 6 },
  nearbyLocation: { fontSize: 13, color: "#555", marginTop: 2 },
  nearbyPrice: { fontSize: 14, color: "#ff7b54", marginTop: 4 },
  nearbyRating: { fontSize: 13, color: "#444", marginTop: 2 },
  viewBtn: { marginTop: 6, backgroundColor: "#ff7b54", paddingVertical: 6, borderRadius: 6, alignItems: "center" },
  viewBtnText: { color: "#fff", fontWeight: "600" },
});
