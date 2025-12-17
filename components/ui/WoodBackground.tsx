// src/components/ui/WoodBackground.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

type WoodBackgroundProps = {
  iconCount?: number;
  isDark?: boolean;
};

export default function WoodBackground({ iconCount = 15, isDark = false }: WoodBackgroundProps) {
  const icons = Array.from({ length: iconCount }).map((_, i) => ({
    key: i,
    top: Math.random() * height,
    left: Math.random() * width,
    size: Math.random() * 30 + 20,
    rotation: Math.random() * 360,
  }));

  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: isDark ? "#1c1c1c" : "#D2B48C",
      }}
    >
      {icons.map((icon) => (
        <MaterialCommunityIcons
          key={icon.key}
          name="home-city"
          size={icon.size}
          color={isDark ? "rgba(255,255,255,0.05)" : "rgba(139,69,19,0.15)"}
          style={{
            position: "absolute",
            top: icon.top,
            left: icon.left,
            transform: [{ rotate: `${icon.rotation}deg` }],
          }}
        />
      ))}
    </View>
  );
}
