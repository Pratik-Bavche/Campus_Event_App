import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";

// Validate event ID format (UUID or numeric)
const isValidEventId = (eventId: string): boolean => {
  if (!eventId) return false;
  // UUID format or numeric ID
  return /^[0-9a-f-]{36}$/.test(eventId) || /^\d+$/.test(eventId);
};

export const shareService = {
  /**
   * Generate a deep link for an event
   * @param eventId - The ID of the event to share
   * @returns The deep link URL
   */
  generateDeepLink: (eventId: string): string => {
    if (!isValidEventId(eventId)) {
      console.error("Invalid event ID format:", eventId);
      throw new Error("Invalid event ID format");
    }
    const prefix = Linking.createURL("");
    return `${prefix}event/${eventId}`;
  },

  /**
   * Share an event with built-in sharing
   * @param eventId - The ID of the event
   * @param eventName - The name of the event
   * @param eventDescription - The description of the event
   */
  shareEvent: async (
    eventId: string,
    eventName: string,
    eventDescription?: string,
  ) => {
    if (!isValidEventId(eventId)) {
      throw new Error("Invalid event ID. Cannot share event.");
    }

    try {
      const deepLink = shareService.generateDeepLink(eventId);

      const message = `${eventName}\n\n${eventDescription || "Check out this event!"}\n\nOpen it: ${deepLink}`;

      const playStoreUrl =
        "https://play.google.com/store/apps/details?id=com.pratikbavche.App";
      const appStoreUrl =
        "https://apps.apple.com/us/app/college-events/id0000000000"; // Replace with actual App Store URL

      let url = message;

      if (Platform.OS === "android") {
        url = `${message}\n\nDownload the app: ${playStoreUrl}`;
      } else if (Platform.OS === "ios") {
        url = `${message}\n\nDownload the app: ${appStoreUrl}`;
      }

      const result = await Share.share({
        message: url,
        title: `Share ${eventName}`,
        url: deepLink, // iOS only
      });

      if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      } else {
        console.log("Share successful");
      }
    } catch (error) {
      console.error("Share error:", error);
      throw error;
    }
  },

  /**
   * Generate a clickable link for the app store
   * @returns Play Store URL
   */
  getPlayStoreUrl: (): string => {
    return "https://play.google.com/store/apps/details?id=com.pratikbavche.App";
  },

  /**
   * Generate a clickable link for the App Store
   * @returns App Store URL
   */
  getAppStoreUrl: (): string => {
    return "https://apps.apple.com/us/app/college-events/id0000000000"; // Replace with actual URL
  },

  /**
   * Generate a shareable URL that can be sent via other apps
   * @param eventId - The event ID
   * @returns The full shareable URL
   */
  generateShareableUrl: (eventId: string): string => {
    const scheme = "collegeevents://event/";
    return `${scheme}${eventId}`;
  },
};
