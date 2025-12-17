// import React, { useEffect, useState, useRef } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   Animated,
// } from "react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { MaterialIcons } from "@expo/vector-icons";

// export default function IndexScreen() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [slide, setSlide] = useState(1);

//   // Animation refs
//   const fadeAnim = useRef(new Animated.Value(1)).current;
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const textFade = useRef(new Animated.Value(0)).current;
//   const textSlide = useRef(new Animated.Value(30)).current;

//   useEffect(() => {
//     const checkLogin = async () => {
//       const token = await AsyncStorage.getItem("userToken");
//       if (token) {
//         router.replace("/Home");
//       } else {
//         setTimeout(() => setLoading(false), 2000);
//       }
//     };
//     checkLogin();
//   }, []);

//   const slides = [
//     {
//       id: 1,
//       bgColor: "#c7d5c5ff",
//       icon: require("../assets/hostel.png"),
//       heading: "Book Your Perfect Hostel",
//       subtitle:
//         "Find safe, affordable hostels with just one tap. Comfort, convenience, and community — all in one place.",
//     },
//     {
//       id: 2,
//       bgColor: "#c7d5c5ff",
//       icon: require("../assets/secure.png"),
//       heading: "Secure Payments",
//       subtitle:
//         "Pay easily and securely within the app — your transactions are protected with advanced encryption.",
//     },
//   ];

//   const currentSlide = slides.find((s) => s.id === slide);

//   // animate both image and text
//   const animateSlide = () => {
//     fadeAnim.setValue(0);
//     slideAnim.setValue(50);
//     textFade.setValue(0);
//     textSlide.setValue(30);

//     Animated.sequence([
//       // Step 1: Image fade + slide in
//       Animated.parallel([
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           useNativeDriver: true,
//         }),
//       ]),

//       // Step 2: Then show text
//       Animated.parallel([
//         Animated.timing(textFade, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }),
//         Animated.spring(textSlide, {
//           toValue: 0,
//           friction: 6,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start();
//   };

//   useEffect(() => {
//     // Run animation when slide changes
//     animateSlide();
//   }, [slide]);

//   const handleNext = () => {
//     if (slide === 1) setSlide(2);
//     else router.push("/Register");
//   };

//   const handleBack = () => setSlide(1);

//   if (loading) {
//     return (
//       <View style={styles.splashContainer}>
//         <Image
//           source={require("../assets/logo.png")}
//           style={styles.splashLogo}
//           resizeMode="contain"
//         />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Top Circle with Animated Icon */}
//       <Animated.View
//         style={[
//           styles.topHalfCircle,
//           {
//             backgroundColor: currentSlide.bgColor,
//             opacity: fadeAnim,
//             transform: [{ translateX: slideAnim }],
//           },
//         ]}
//       >
//         <Image source={currentSlide.icon} style={styles.hostelIcon} />
//       </Animated.View>

//       {/* Text Section */}
//       <Animated.View
//         style={[
//           styles.textSection,
//           {
//             opacity: textFade,
//             transform: [{ translateY: textSlide }],
//           },
//         ]}
//       >
//         <Text style={styles.heading}>{currentSlide.heading}</Text>
//         <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
//       </Animated.View>

//       {/* Bottom Buttons */}
//       <View style={styles.bottomButtons}>
//         {slide === 2 ? (
//           <TouchableOpacity onPress={handleBack}>
//             <Text style={styles.skipText}>Back</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity onPress={() => router.push("/login")}>
//             <Text style={styles.skipText}>Skip</Text>
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
//           <MaterialIcons name="arrow-forward" size={28} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../components/AuthProvider";
import { MaterialIcons } from "@expo/vector-icons";

export default function IndexScreen() {
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useAuth();
  const [slide, setSlide] = useState(1);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/Home");
    }
  }, [isInitialized, isAuthenticated]);

  const slides = [
    {
      id: 1,
      bgColor: "#c7d5c5ff",
      icon: require("../assets/hostel.png"),
      heading: "Book Your Perfect Hostel",
      subtitle: "Find safe, affordable hostels with just one tap. Comfort, convenience, and community — all in one place.",
    },
    {
      id: 2,
      bgColor: "#c7d5c5ff",
      icon: require("../assets/secure.png"),
      heading: "Secure Payments",
      subtitle: "Pay easily and securely within the app — your transactions are protected with advanced encryption.",
    },
  ];

  const currentSlide = slides.find((s) => s.id === slide);

  const animateSlide = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    textFade.setValue(0);
    textSlide.setValue(30);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  useEffect(() => {
    animateSlide();
  }, [slide]);

  const handleNext = () => {
    if (slide === 1) setSlide(2);
    else router.push("/Register");
  };

  const handleBack = () => setSlide(1);

  // Show loading while initializing auth
  if (!isInitialized) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Circle with Animated Icon */}
      <Animated.View
        style={[
          styles.topHalfCircle,
          {
            backgroundColor: currentSlide.bgColor,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Image source={currentSlide.icon} style={styles.hostelIcon} />
      </Animated.View>

      {/* Text Section */}
      <Animated.View
        style={[
          styles.textSection,
          {
            opacity: textFade,
            transform: [{ translateY: textSlide }],
          },
        ]}
      >
        <Text style={styles.heading}>{currentSlide.heading}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
      </Animated.View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        {slide === 2 ? (
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.skipText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <MaterialIcons name="arrow-forward" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ... styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5d488ff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  splashContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    width: 220,
    height: 220,
  },
  topHalfCircle: {
    width: 500,
    height: 350,
    borderBottomLeftRadius: 350,
    borderBottomRightRadius: 350,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 30,
  },
  hostelIcon: {
  width: 300,
  height: 315,
  marginTop: 30,
  marginLeft: -20,
  borderBottomLeftRadius: 80,   // round bottom-left corner
  borderBottomRightRadius: 80,  // round bottom-right corner
  borderTopLeftRadius: 0,       // keep top corners sharp
  borderTopRightRadius: 0,
  overflow: "hidden",           // ensures the image actually gets rounded
},

  textSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    marginBottom: 40,
  },
  heading: {
    fontSize: 28,
    color: "#296601ff",
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#fffcfcff",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
  },
  bottomButtons: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  skipText: {
    fontSize: 18,
    color: "#03361fff",
    fontWeight: "700",
  },
  nextButton: {
    backgroundColor: "#3fa763ff",
    width: 65,
    height: 65,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3FA796",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 6,
  },
});
