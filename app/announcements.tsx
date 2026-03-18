import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Megaphone } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { useDataStore } from "../store/useDataStore";

const { width } = Dimensions.get("window");

export default function AnnouncementsScreen() {
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const { announcements, fetchAnnouncements, isAnnouncementsLoading, events } =
    useDataStore();
  const [now, setNow] = React.useState(new Date());

  useEffect(() => {
    fetchAnnouncements();
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // 30 seconds
    return () => clearInterval(timer);
  }, []);

  const activeAnnouncements = announcements.filter(a => {
    if (a.eventId) {
      const associatedEvent = events.find(e => String(e.id) === String(a.eventId));
      if (associatedEvent) {
        const isPastDeadline = associatedEvent.deadline ? new Date(associatedEvent.deadline).getTime() <= now.getTime() : false;
        return !isPastDeadline;
      }
      return false; // Remove if event is missing
    }
    return true;
  });

  const renderAnnouncement = ({ item }: { item: any }) => (
    <View
      style={[
        styles.announcementCard,
        {
          backgroundColor: "#fff7ed",
          borderColor: "#fdba74",
          borderLeftWidth: 4,
          borderLeftColor: "#f97316",
        },
      ]}
    >
      <View
        style={[
          styles.announcementIcon,
          {
            backgroundColor: "#f97316",
          },
        ]}
      >
        {item.pinned ? (
          <Megaphone size={20} color="#fff" />
        ) : (
          <Megaphone size={20} color="#fff" />
        )}
      </View>
      <View style={styles.announcementTextContent}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.announcementTitle, { color: colors.text, flex: 1 }]}
          >
            {item.pinned && "📌 "}
            {item.title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.announcementBody, { color: colors.textMuted }]}>
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: Platform.OS === "ios" ? 60 : 60, // Consistent top padding
          paddingBottom: 24,
          paddingHorizontal: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          elevation: 4,
          ...Platform.select({
            web: {
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            },
            default: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }
          }),
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={20} color="#fff" />
          </View>
        </Pressable>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
          Announcements
        </Text>
      </View>

      {activeAnnouncements && activeAnnouncements.length > 0 ? (
        <>
          <View
            style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 }}
          >
            <Text style={[styles.sliderTitle, { color: colors.text }]}>
              Latest Announcements
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <FlatList
              data={activeAnnouncements}
              renderItem={renderAnnouncement}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width - 64}
              decelerationRate="fast"
              contentContainerStyle={styles.sliderContent}
              refreshing={isAnnouncementsLoading}
              onRefresh={fetchAnnouncements}
              scrollEventThrottle={16}
              style={{ width }}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.textMuted }}>
            No announcements found
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    paddingBottom: 100,
    gap: 16,
  },
  sliderContainer: {
    height: 240,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sliderContent: {
    gap: 16,
    paddingRight: 24,
  },
  sliderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  announcementCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
    width: width - 64,
    minHeight: 200,
  },
  announcementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  announcementTextContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  announcementBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
});
