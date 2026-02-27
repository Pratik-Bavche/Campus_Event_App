import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { CheckCircle2, ChevronRight, Megaphone, QrCode, Scan, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/theme";
import { attendanceService } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { useDataStore } from "../../store/useDataStore";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const {
    events,
    myRegistrations,
    announcements,
    fetchEvents,
    fetchAnnouncements,
    isEventsLoading,
  } = useDataStore();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [filteredEvents, setFilteredEvents] = React.useState(events);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  const announcementScrollRef = useRef<FlatList>(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const moveAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();

    // Header Animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }, []);

  // Auto-scroll announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % announcements.length;
        announcementScrollRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [announcements.length]);

  useEffect(() => {
    let filtered = [...events];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((e) => {
        if (selectedCategory === "Technical")
          return (
            e.club.toLowerCase().includes("coding") ||
            e.club.toLowerCase().includes("tech")
          );
        if (selectedCategory === "Cultural")
          return (
            e.club.toLowerCase().includes("dance") ||
            e.club.toLowerCase().includes("music") ||
            e.club.toLowerCase().includes("drama")
          );
        if (selectedCategory === "Sports")
          return (
            e.club.toLowerCase().includes("sports") ||
            e.club.toLowerCase().includes("cricket")
          );
        if (selectedCategory === "Today") {
          const today = new Date().toISOString().split("T")[0];
          return e.date.startsWith(today);
        }
        if (selectedCategory === "This Week") {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const eventDate = new Date(e.date);
          return eventDate >= new Date() && eventDate <= nextWeek;
        }
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory]);

  const handleScanAttendance = async () => {
    if (isAttendanceMarked) {
      Alert.alert('Already Marked', 'Your attendance has already been recorded.');
      return;
    }

    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to scan QR codes.');
        return;
      }
    } else if (!permission.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to scan QR codes.');
        return;
      }
    }
    setShowScanner(true);
  };

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);

    try {
      // The QR code usually contains the event ID
      // We'll mark attendance using the new attendanceService
      await attendanceService.markAttendance(data, 'QR');

      setIsAttendanceMarked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Attendance Marked', 'Your attendance has been successfully recorded!', [
        { text: 'OK' }
      ]);
    } catch (error: any) {
      console.error('Attendance marking failed:', error);
      Alert.alert(
        'Attendance Error',
        error.message || 'Failed to record attendance. Please ensure you are scanning the correct event QR code.'
      );
    }
  };

  const popularEvents = [...events]
    .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
    .slice(0, 3);
  const categories = [
    "All",
    "Today",
    "This Week",
    "Technical",
    "Cultural",
    "Sports",
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={isEventsLoading}
          onRefresh={fetchEvents}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Animated Gradient Header */}
      <LinearGradient
        colors={colors.headerGradient as any}
        style={styles.header}
      >
        {/* Animated Background Elements */}
        <Animated.View
          style={[
            styles.headerBgCircle,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.15],
              }),
              transform: [
                {
                  translateX: moveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 20],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.headerBgCircleSmall,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
              transform: [
                {
                  translateY: moveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 30],
                  }),
                },
              ],
            },
          ]}
        />

        <View style={styles.headerTop}>
          <View>
            <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
              Welcome Back!
            </Animated.Text>
            <Animated.Text
              style={[styles.subWelcomeText, { opacity: fadeAnim }]}
            >
              Discover amazing events
            </Animated.Text>
          </View>

          <Pressable
            onPress={handleScanAttendance}
            style={({ pressed }) => [
              styles.scannerButton,
              isAttendanceMarked && styles.attendanceMarkedButton,
              { transform: [{ scale: pressed ? 0.9 : 1 }] }
            ]}
          >
            {isAttendanceMarked ? (
              <CheckCircle2 size={24} color="#fff" />
            ) : (
              <Scan size={24} color="#fff" />
            )}
          </Pressable>
        </View>

        {/* Attendance Scanner Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showScanner}
          onRequestClose={() => setShowScanner(false)}
        >
          <View style={styles.scannerWrapper}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={onBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />

            {/* Scanner Overlay */}
            <View style={styles.overlay}>
              <View style={styles.unfilled} />
              <View style={{ flexDirection: 'row' }}>
                <View style={styles.unfilled} />
                <View style={styles.focused}>
                  <View style={styles.scannerFrame} />
                </View>
                <View style={styles.unfilled} />
              </View>
              <View style={styles.unfilled} />
            </View>

            {/* UI Elements on top of camera */}
            <View style={styles.scannerHeader}>
              <Pressable
                onPress={() => setShowScanner(false)}
                style={styles.closeButton}
              >
                <X size={28} color="#fff" />
              </Pressable>
              <Text style={styles.scannerTitle}>Scan Attendance QR</Text>
            </View>

            <View style={styles.scannerFooter}>
              <View style={styles.scannerHint}>
                <QrCode size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.scannerHintText}>Align QR code within the frame</Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Quick Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {events.filter((e) => e.status === "Open").length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                myRegistrations.filter(
                  (r) => r.event && new Date(r.event.date) >= new Date(),
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {
                myRegistrations.filter(
                  (r) => r.event && new Date(r.event.date) < new Date(),
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </Animated.View>

        {/* Categories Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat, idx) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.2)",
                },
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === cat ? colors.primary : "#fff" },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Auto-scrolling Announcements Carousel */}
        {announcements.length > 0 && (
          <>
            <View
              style={{ paddingHorizontal: 20, marginBottom: 12, marginTop: 12 }}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Announcements
              </Text>
            </View>
            <View style={styles.announcementCarouselContainer}>
              <FlatList
                ref={announcementScrollRef}
                data={announcements}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.announcementCarouselCard,
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
                      <Megaphone size={20} color="#fff" />
                    </View>
                    <View style={styles.announcementTextContent}>
                      <Text
                        style={[
                          styles.announcementTitle,
                          { color: colors.text },
                        ]}
                      >
                        {item.pinned && "📌 "}
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.announcementBody,
                          { color: colors.textMuted },
                        ]}
                        numberOfLines={2}
                      >
                        {item.content}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.textMuted,
                          marginTop: 6,
                        }}
                      >
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={width - 60}
                decelerationRate="fast"
                contentContainerStyle={styles.announcementCarouselContent}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) => {
                  const contentOffsetX = event.nativeEvent.contentOffset.x;
                  const currentIndex = Math.round(
                    contentOffsetX / (width - 60),
                  );
                  setCurrentAnnouncementIndex(
                    Math.min(currentIndex, announcements.length - 1),
                  );
                }}
              />
            </View>
            {/* Indicator Dots */}
            <View style={styles.indicatorContainer}>
              {announcements.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicatorDot,
                    {
                      backgroundColor:
                        index === currentAnnouncementIndex
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {/* Popular Events */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Popular Events
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/events")}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See All
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        >
          {popularEvents.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/event/${item.id}`)}
              style={({ pressed }) => [
                styles.featuredCard,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Image
                source={{ uri: item.poster || 'https://via.placeholder.com/400x200' }}
                style={styles.featuredImage}
              />
              <View style={styles.badgeContainer}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.badgeText}>Technical</Text>
                </View>
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Text style={styles.statusTagText}>Soon</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Upcoming Deadlines
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/events")}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={{ color: colors.primary }}>View All</Text>
            </Pressable>
          </View>
          {filteredEvents.length > 0 ? (
            filteredEvents.slice(0, 5).map((event) => (
              <Card
                key={event.id}
                style={styles.deadlineCard}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <View style={styles.deadlineInfo}>
                  <Text style={[styles.deadlineName, { color: colors.text }]}>
                    {event.name}
                  </Text>
                  <Text style={[styles.deadlineDate, { color: colors.error }]}>
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(event.deadline).getTime() -
                          new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                      ),
                    )}{" "}
                    days left
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            ))
          ) : (
            <View style={styles.noResults}>
              <Text style={{ color: colors.textMuted }}>
                No events match your criteria
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    position: "relative",
    overflow: "hidden",
  },
  headerBgCircle: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
  },
  headerBgCircleSmall: {
    position: "absolute",
    bottom: 10,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
    zIndex: 10,
  },
  scannerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  attendanceMarkedButton: {
    backgroundColor: '#22c55e', // Green-500
    borderColor: '#4ade80', // Green-400
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  subWelcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  categoryScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    marginTop: -20,
    paddingTop: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  announcementCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    borderWidth: 1,
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
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  featuredList: {
    paddingLeft: 24,
    gap: 20,
  },
  featuredCard: {
    width: width - 80,
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  badgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  deadlineCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  deadlineDate: {
    fontSize: 12,
  },
  noResults: {
    alignItems: "center",
    padding: 30,
  },
  announcementCarouselContainer: {
    height: 130,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  announcementCarouselContent: {
    gap: 16,
    paddingRight: 20,
  },
  announcementCarouselCard: {
    width: width - 60,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    borderWidth: 1,
    minHeight: 110,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scannerWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scannerFooter: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scannerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
  },
  scannerHintText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  unfilled: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  focused: {
    width: 280,
    height: 280,
  },
  scannerFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});
