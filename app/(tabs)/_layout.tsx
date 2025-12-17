// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const getIconName = (routeName: string) => {
    switch (routeName) {
      case "Home":
        return "home"; // 🏠
      case "Bookings":
        return "book"; // 📖
      case "Search":
        return "search"; // 🔍
      case "Payments":
        return "card"; // 💳
      case "Settings":
        return "settings"; // ⚙️
      default:
        return "ellipse"; // fallback
    }
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#007AFF", // iOS blue style
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={getIconName(route.name)} size={size} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
      <Tabs.Screen name="Bookings" options={{ title: "Bookings" }} />
      <Tabs.Screen name="Search" options={{ title: "Search" }} />
      <Tabs.Screen name="Payments" options={{ title: "Payments" }} />
      <Tabs.Screen name="Settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
