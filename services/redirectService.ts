import { Alert, Linking, Platform } from "react-native";

export const redirectService = {
  /**
   * Open the Play Store (Android) or App Store (iOS) listing
   * @param platform - 'android' or 'ios' (defaults to current platform)
   */
  openAppStore: async (platform?: "android" | "ios") => {
    try {
      const currentPlatform = platform || (Platform.OS as "android" | "ios");

      if (currentPlatform === "android") {
        const playStoreUrl =
          "https://play.google.com/store/apps/details?id=com.pratikbavche.App";
        await Linking.openURL(playStoreUrl);
      } else if (currentPlatform === "ios") {
        const appStoreUrl =
          "https://apps.apple.com/us/app/college-events/id0000000000"; // Update with your actual App Store ID
        await Linking.openURL(appStoreUrl);
      }
    } catch (error) {
      console.error("Failed to open app store:", error);
      Alert.alert(
        "Error",
        "Unable to open app store. Please visit it manually.",
      );
    }
  },

  /**
   * Handle URL opening with error handling
   * @param url - The URL to open
   */
  openURL: async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      console.error("Failed to open URL:", error);
      Alert.alert("Error", "Failed to open URL");
    }
  },

  /**
   * Generate a fallback web URL for redirect
   * This can be used to handle cases where the app is not installed
   * @param eventId - The event ID to navigate to
   * @returns A URL that can be used as a fallback
   */
  generateFallbackUrl: (eventId: string): string => {
    // This could be your web URL where you handle app store redirects
    // Example: https://collegeevents.com/event/123
    const baseUrl = "https://collegeevents.com"; // Replace with your actual domain
    return `${baseUrl}/event/${eventId}`;
  },
};
