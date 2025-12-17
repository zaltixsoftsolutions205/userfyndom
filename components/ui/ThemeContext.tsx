// components/ui/ThemeContext.tsx
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);

/**
 * Returns a React Navigation theme based on isDark value
 */
export const getNavigationTheme = (isDark: boolean): Theme => {
  return isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#1E1E1E",
          card: "#2c2c2c",
          text: "#fff",
          border: "#555",
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: "rgba(255,255,255,0.85)",
          card: "rgba(255,255,255,0.85)",
          text: "#4b2e0f",
          border: "#ccc",
        },
      };
};
