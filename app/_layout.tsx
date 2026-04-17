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
      // Only process official scheme or links containing 'event'
      if (!url || (!url.includes("collegeevents://") && !url.includes("event/"))) {
        return;
      }

      console.log("Processing deep link:", url);

      try {
        // Extract the path part
        let path = url;
        if (url.includes("://")) {
          const pathMatch = url.match(/^[a-z]+:\/\/(.+)$/i);
          path = pathMatch ? pathMatch[1] : url;
        }

        // Extract event ID from path (e.g., "event/123" -> "123")
        const parts = path
          .split("/")
          .filter((p) => p && p !== "event" && p !== "events" && !p.includes(":")); // Filter out server/port parts

        if (parts.length > 0) {
          let eventId = parts[parts.length - 1]; // Take the last part which is likely the ID

          // Clean up the event ID
          eventId = eventId.split("?")[0].split("#")[0].trim();

          // Validate UUID format or numeric ID, and ensure it's not a server address
          const isServerAddress = eventId.includes(":") || eventId.includes("10.") || eventId.includes("192.");

          if (!isServerAddress && eventId.length >= 1) {
            console.log("Extracted valid event ID:", eventId);
            setTimeout(() => {
              router.push(`/event/${eventId}`);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error parsing deep link:", error);
      }
    };

    // Handle app opened with deep link
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url) handleDeepLink(url);
    });

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        // Only process if it looks like an actual event link, not the dev server
        if (url.includes("collegeevents://") || (url.includes("event/") && !url.includes(":8081"))) {
          console.log("Initial deep link:", url);
          handleDeepLink(url);
        }
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onWelcomeScreen = segments[0] === "welcome";

    if (!isAuthenticated && !inAuthGroup && !onWelcomeScreen) {
      router.replace("/welcome");
    } else if (isAuthenticated && (inAuthGroup || onWelcomeScreen)) {
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
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
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
