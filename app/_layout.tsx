import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import * as Linking from "expo-linking";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "../constants/theme";
import { useAuthStore } from "../store/useAuthStore";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const colors = Colors[theme];

  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log("Processing deep link:", url);

      try {
        // Parse the URL to extract event ID
        // URL formats can be:
        // collegeevents://event/123
        // app://event/123

        // Extract the path part after the scheme
        // For "collegeevents://event/123", we get "event/123"
        const pathMatch = url.match(/^[a-z]+:\/\/(.+)$/i);
        const path = pathMatch ? pathMatch[1] : url;

        // Extract event ID from path (e.g., "event/123" -> "123")
        const parts = path
          .split("/")
          .filter((p) => p && p !== "event" && p !== "events"); // Remove empty strings and route name

        if (parts.length > 0) {
          let eventId = parts[0];

          // Clean up the event ID - remove any query params or fragments
          eventId = eventId.split("?")[0].split("#")[0].trim();

          // Validate event ID is not a server address
          if (
            !eventId.includes(":") &&
            !eventId.includes("10.") &&
            !eventId.includes("192.")
          ) {
            console.log("Extracted valid event ID:", eventId);

            // Navigate to event details
            setTimeout(() => {
              router.push(`/event/${eventId}`);
            }, 500); // Delay to ensure auth is checked
          } else {
            console.warn(
              "Invalid event ID format (contains server address):",
              eventId,
            );
          }
        }
      } catch (error) {
        console.error("Error parsing deep link:", error);
      }
    };

    // Handle app opened with deep link
    const subscription = Linking.addEventListener("url", ({ url }) => {
      console.log("Deep link event received:", url);
      handleDeepLink(url);
    });

    // Check if there's an initial URL (app opened with deep link)
    Linking.getInitialURL().then((url) => {
      if (url != null) {
        console.log("Initial deep link:", url);
        handleDeepLink(url);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ presentation: "card" }} />
        <Stack.Screen
          name="register/[id]"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
