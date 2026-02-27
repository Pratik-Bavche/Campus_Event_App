import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, Clock, Hash, Search, Users } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Colors } from "../../constants/theme";
import { useDataStore } from "../../store/useDataStore";

export default function EventsScreen() {
  const { q } = useLocalSearchParams();
  const { events, fetchEvents, isEventsLoading } = useDataStore();
  const [searchQuery, setSearchQuery] = useState((q as string) || "");
  const [selectedCategory, setSelectedCategory] = useState("All Events");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [filteredEvents, setFilteredEvents] = useState(events);

  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (q !== undefined) {
      setSearchQuery((q as string) || "");
    }
  }, [q]);

  useEffect(() => {
    let filtered = events.filter(
      (event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.club.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    if (selectedCategory !== "All Events") {
      // For now using club as category mapping or just static labels
      filtered = filtered.filter(
        (e) =>
          e.club.includes(selectedCategory) ||
          (selectedCategory === "Technical" && e.club === "Coding Club"),
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((e) => e.status === selectedStatus);
    }

    setFilteredEvents(filtered);
  }, [searchQuery, events, selectedCategory, selectedStatus]);

  const categories = ["All Events", "Technical", "Cultural", "Sports"];
  const statuses = ["All", "Open", "Closed"];

  const renderEventItem = ({ item }: { item: any }) => (
    <Card
      style={styles.eventCard}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <View style={styles.eventRow}>
        <Image source={{ uri: item.poster || 'https://via.placeholder.com/400x200' }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.eventName, { color: colors.text }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "Open"
                      ? colors.success + "15"
                      : colors.error + "15",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === "Open" ? colors.success : colors.error,
                  },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>

          <View style={styles.clubRow}>
            <View style={[styles.clubIcon, { backgroundColor: colors.border }]}>
              <Hash size={12} color={colors.textMuted} />
            </View>
            <Text style={[styles.clubName, { color: colors.textMuted }]}>
              {item.club}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Calendar size={14} color={colors.textMuted} />
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textMuted} />
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                {new Date(item.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Users size={14} color={colors.textMuted} />
              <Text style={[styles.detailText, { color: colors.textMuted }]}>
                {item.registeredCount || 0}/{item.maxCapacity || "∞"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Curved Blue Header */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: Platform.OS === "ios" ? 60 : 60,
          paddingBottom: 24,
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
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
          All Events
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.header}>
        <Input
          placeholder="Search events or clubs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={20} color={colors.textMuted} />}
          containerStyle={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor:
                    selectedCategory === cat ? colors.primary : colors.border,
                },
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedCategory === cat ? "#fff" : colors.textMuted,
                  },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.statusFilters}>
          {statuses.map((stat) => (
            <Pressable
              key={stat}
              onPress={() => setSelectedStatus(stat)}
              style={({ pressed }) => [
                styles.statusTab,
                {
                  borderColor:
                    selectedStatus === stat ? colors.primary : colors.border,
                  backgroundColor:
                    selectedStatus === stat
                      ? colors.primary + "10"
                      : "transparent",
                },
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
            >
              <Text
                style={[
                  styles.statusTabText,
                  {
                    color:
                      selectedStatus === stat
                        ? colors.primary
                        : colors.textMuted,
                  },
                ]}
              >
                {stat}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isEventsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textMuted }}>No events found</Text>
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
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 8,
    marginTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 16,
  },
  filterScroll: {
    gap: 12,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusFilters: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statusTab: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  eventCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
  },
  eventRow: {
    flexDirection: "row",
    gap: 28,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  eventInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  clubIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  clubName: {
    fontSize: 13,
  },
  repPhone: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
});
