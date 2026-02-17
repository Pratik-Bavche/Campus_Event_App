import { useLocalSearchParams, useRouter } from "expo-router";
import { Award } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/theme";
import { useDataStore } from "../../store/useDataStore";

export default function RegistrationsScreen() {
  const {
    myRegistrations,
    fetchRegistrations,
    isRegistrationsLoading,
    cancelRegistration,
  } = useDataStore();
  const { tab } = useLocalSearchParams();
  const [selectedTab, setSelectedTab] = useState("All");
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];
  const router = useRouter();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (tab && ["All", "Completed", "Cancelled"].includes(tab as string)) {
      setSelectedTab(tab as string);
    }
  }, [tab]);

  const tabs = ["All", "Completed", "Cancelled"];

  const filteredRegistrations = myRegistrations.filter((reg) => {
    if (selectedTab === "All") return reg.status !== "cancelled";
    if (selectedTab === "Completed")
      return (
        new Date(reg.event.date) <= new Date() && reg.status !== "cancelled"
      );
    if (selectedTab === "Cancelled") return reg.status === "cancelled";
    return true;
  });

  const handleDownloadCertificate = (eventName: string) => {
    Alert.alert(
      "Download Certificate",
      `Your certificate for ${eventName} is being generated and will be downloaded shortly.`,
      [{ text: "OK" }],
    );
  };

  const handleCancel = (registrationId: string, eventName: string) => {
    Alert.alert(
      "Cancel Registration",
      `Are you sure you want to cancel your registration for ${eventName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelRegistration(registrationId);
              Alert.alert("Success", "Registration cancelled successfully.");
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to cancel registration. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const renderRegistrationItem = ({ item }: { item: any }) => {
    const isCancelled = item.status === "cancelled";
    const isCompleted = new Date(item.event.date) <= new Date();

    return (
      <Card style={[styles.regCard, isCancelled && { opacity: 0.7 }]}>
        <View style={styles.eventRow}>
          <Image
            source={{ uri: item.event.poster }}
            style={styles.eventImage}
          />
          <View style={styles.eventInfo}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.eventName, { color: colors.text }]}
                numberOfLines={2}
              >
                {item.event.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isCancelled
                      ? colors.error + "15"
                      : isCompleted
                        ? colors.success + "15"
                        : colors.primary + "15",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isCancelled
                        ? colors.error
                        : isCompleted
                          ? colors.success
                          : colors.primary,
                    },
                  ]}
                >
                  {isCancelled
                    ? "Cancelled"
                    : isCompleted
                      ? "Completed"
                      : "Confirmed"}
                </Text>
              </View>
            </View>

            {!isCancelled && !isCompleted && (
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.primary + "10" },
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={() => router.push(`/event/${item.event.id}`)}
                >
                  <Text
                    style={[styles.actionButtonText, { color: colors.primary }]}
                  >
                    View Details
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.error + "10" },
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={() => handleCancel(item.id, item.event.name)}
                >
                  <Text
                    style={[styles.actionButtonText, { color: colors.error }]}
                  >
                    Cancel
                  </Text>
                </Pressable>
              </View>
            )}

            {(isCancelled || isCompleted) && (
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.primary + "10" },
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={() => router.push(`/event/${item.event.id}`)}
                >
                  <Text
                    style={[styles.actionButtonText, { color: colors.primary }]}
                  >
                    View Details
                  </Text>
                </Pressable>
                {isCompleted && !isCancelled && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: "#10b98115" },
                      { transform: [{ scale: pressed ? 0.98 : 1 }] },
                    ]}
                    onPress={() => handleDownloadCertificate(item.event.name)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Award size={14} color="#10b981" />
                      <Text
                        style={[styles.actionButtonText, { color: "#10b981" }]}
                      >
                        Certificate
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Curved Blue Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: Platform.OS === "ios" ? 60 : 60,
          paddingBottom: 12,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          My Registrations
        </Text>
      </View>

      {/* Tabs below the blue header */}
      <View
        style={[styles.tabContainer, { paddingHorizontal: 24, marginTop: 12 }]}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={({ pressed }) => [
              styles.tab,
              {
                backgroundColor:
                  selectedTab === tab ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.03)",
              },
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Text style={[styles.tabText, { color: colors.text }]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {isRegistrationsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRegistrations}
          renderItem={renderRegistrationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textMuted }}>
                No events found in this category.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  regCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
  },
  eventRow: {
    flexDirection: "row",
    gap: 16,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  eventInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  clubRow: {
    marginBottom: 8,
  },
  clubName: {
    fontSize: 13,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
});
