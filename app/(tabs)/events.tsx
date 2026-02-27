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
  useWindowDimensions,
  View,
} from "react-native";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Colors } from "../../constants/theme";
import { useDataStore } from "../../store/useDataStore";

export default function EventsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
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
      style={[styles.eventCard, { width: isTablet ? '48%' : '100%' }]}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <View style={[styles.eventRow, { gap: isTablet ? 20 : 16 }]}>
        <Image
          source={{ uri: item.poster || 'https://via.placeholder.com/400x200' }}
          style={[styles.eventImage, { width: isTablet ? 120 : 100, height: isTablet ? 120 : 100 }]}
        />
        <View style={styles.eventInfo}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.eventName, { color: colors.text, fontSize: isTablet ? 18 : 16 }]}
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
            <Text style={[styles.clubName, { color: colors.textMuted, fontSize: isTablet ? 14 : 13 }]}>
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
          paddingBottom: isTablet ? 32 : 24,
          paddingHorizontal: isTablet ? 40 : 24,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        <Text style={{ fontSize: isTablet ? 34 : 28, fontWeight: "bold", color: "#fff" }}>
          All Events
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={[styles.header, { paddingHorizontal: isTablet ? 40 : 24 }]}>
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
                  paddingHorizontal: isTablet ? 24 : 20,
                  paddingVertical: isTablet ? 12 : 10,
                },
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedCategory === cat ? "#fff" : colors.textMuted,
                    fontSize: isTablet ? 15 : 14
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
                  paddingHorizontal: isTablet ? 32 : 24,
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
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? { gap: 16, paddingHorizontal: 40 } : null}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: isTablet ? 0 : 24, paddingTop: 8 }
          ]}
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
    borderRadius: 20,
  },
  filterChipText: {
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
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100,
  },
  eventCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
  },
  eventRow: {
    flexDirection: "row",
  },
  eventImage: {
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
