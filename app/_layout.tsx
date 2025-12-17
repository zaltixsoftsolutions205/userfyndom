// // app/_layout.tsx
// import { ThemeProvider, useThemeContext } from "@/components/ui/ThemeContext";
// import { useFonts } from "expo-font";
// import { Stack } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import React from "react";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { Provider } from "react-redux";
// import { store } from "../app/reduxStore/store/store";

// // Stack component using Expo Router
// function AppStack() {
//   const { isDark } = useThemeContext();

//   return (
//     <Stack
//       screenOptions={{
//         headerShown: false,
//         // Apply theme colors to headers if needed
//         contentStyle: { backgroundColor: isDark ? "#1E1E1E" : "rgba(255,255,255,0.85)" },
//       }}
//     />
//   );
// }

// export default function RootLayout() {
//   const [fontsLoaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   if (!fontsLoaded) return null;

//   return (
//     <Provider store={store}>
//     <ThemeProvider>
//       <SafeAreaProvider>
//         <AppStack />
//         <StatusBar style="auto" />
//       </SafeAreaProvider>
//     </ThemeProvider>
//     </Provider>
//   );
// }


// app/_layout.tsx
import { ThemeProvider, useThemeContext } from "@/components/ui/ThemeContext";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../app/reduxStore/store/store";
import { AuthProvider } from "../components/AuthProvider";

// Stack component using Expo Router
function AppStack() {
  const { isDark } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? "#1E1E1E" : "rgba(255,255,255,0.85)" },
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AuthProvider>
            <AppStack />
            <StatusBar style="auto" />
          </AuthProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}