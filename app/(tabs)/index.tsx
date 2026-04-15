import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, CheckCircle2, ChevronRight, Clock, Megaphone, QrCode, Scan, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
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
import { formatDate, formatTime12h } from "../../utils/dateFormatter";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const {
    events,
    myRegistrations,
    announcements,
    fetchEvents,
    fetchRegistrations,
    fetchAnnouncements,
    isEventsLoading,
  } = useDataStore();
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [filteredEvents, setFilteredEvents] = React.useState(events);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<any>(null);
  const [isAttendanceMarked, setIsAttendanceMarked] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // 30 seconds
    return () => clearInterval(timer);
  }, []);

  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  const announcementScrollRef = useRef<FlatList>(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const moveAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
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

  const activeAnnouncements = announcements.filter(a => {
    if (a.eventId) {
      const associatedEvent = events.find(e => String(e.id) === String(a.eventId));
      if (associatedEvent) {
        const isPastDeadline = associatedEvent.deadline ? new Date(associatedEvent.deadline).getTime() <= now.getTime() : false;
        return !isPastDeadline && associatedEvent.status === "Open";
      }
      return false; // Remove if event is missing
    }
    return true;
  });

  // Auto-scroll announcements
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % activeAnnouncements.length;
        announcementScrollRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000); // Change announcement every 5 seconds

    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  useEffect(() => {
    let filtered = events.filter(e => {
      const isPastDeadline = e.deadline ? new Date(e.deadline).getTime() <= now.getTime() : false;
      return !isPastDeadline && e.status === "Open";
    });

    const upcomingExist = filtered.length > 0;

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

    // Fallback to recent closed events if no upcoming events match and we are in "All" category
    if (filtered.length === 0 && selectedCategory === "All" && !upcomingExist) {
        filtered = events
        .filter(e => e.status === "Closed" || (e.deadline && new Date(e.deadline).getTime() <= now.getTime()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2);
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, now]);

  const handleScanAttendance = async () => {
    if (isAttendanceMarked) {
      Alert.alert('Already Marked', 'Your attendance has already been recorded.');
      return;
    }

    setShowEventPicker(true);
  };

  const startScanner = async (event: any) => {
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
    
    setSelectedEventForAttendance(event);
    setShowEventPicker(false);
    setShowScanner(true);
  };

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    setShowScanner(false);

    try {
      // Validate that the scanned data contains a UUID (or is a UUID itself)
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = data.match(uuidRegex);
      const scannedId = match ? match[0] : null;

      if (!scannedId) {
        throw new Error('Invalid QR Code. Please scan the correct event attendance QR.');
      }

      // Verify if scanned ID matches the selected event
      if (selectedEventForAttendance && scannedId.toLowerCase() !== selectedEventForAttendance.id.toLowerCase()) {
        throw new Error(`This QR code is for a different event. Please scan the QR for "${selectedEventForAttendance.name}".`);
      }

      await attendanceService.markAttendance(data, 'QR');

      setIsAttendanceMarked(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Attendance Marked', 'Your attendance has been successfully recorded!', [
        { text: 'OK' }
      ]);
    } catch (error: any) {
      console.log('Attendance scan handled:', error.message);

      let errorMsg = 'Failed to record attendance. Please try again.';
      if (typeof error.message === 'string') {
        if (error.message.includes('already marked')) {
          errorMsg = 'Attendance already marked for this event.';
        } else if (error.message.includes('Invalid QR')) {
          errorMsg = 'This QR code is invalid. Please scan the event attendance QR.';
        } else {
          errorMsg = error.message;
        }
      }

      Alert.alert('Attendance Error', errorMsg);
    }
  };

  // Quick Stats Calculation
  const activeCount = events.filter((e) => {
    const isDeadlinePassed = e.deadline ? new Date(e.deadline).getTime() <= now.getTime() : false;
    return e.status === "Open" && !isDeadlinePassed;
  }).length;

  const currentRegistrations = myRegistrations.filter((r) => {
    if (!r.event || r.status === "CANCELLED") return false;
    const isPastDeadline = r.event.deadline ? new Date(r.event.deadline).getTime() <= now.getTime() : false;
    return !isPastDeadline;
  }).length;

  const finishedRegistrations = myRegistrations.filter((r) => {
    if (!r.event || r.status === "CANCELLED") return false;
    const isPastDeadline = r.event.deadline ? new Date(r.event.deadline).getTime() <= now.getTime() : false;
    return isPastDeadline;
  }).length;

  const openEventsForPopular = events
    .filter(e => {
      const isPastDeadline = e.deadline ? new Date(e.deadline).getTime() <= now.getTime() : false;
      return !isPastDeadline && e.status === "Open";
    });

  const popularEvents = openEventsForPopular.length > 0
    ? [...openEventsForPopular]
        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
        .slice(0, 3)
    : events
        .filter(e => e.status === "Closed" || (e.deadline && new Date(e.deadline).getTime() <= now.getTime()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2);
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

        {/* Event Selection Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showEventPicker}
          onRequestClose={() => setShowEventPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.eventPickerContainer, { backgroundColor: colors.card }]}>
              <View style={styles.eventPickerHeader}>
                <Text style={[styles.eventPickerTitle, { color: colors.text }]}>Select Event</Text>
                <Pressable onPress={() => setShowEventPicker(false)}>
                  <X size={24} color={colors.textMuted} />
                </Pressable>
              </View>

              <Text style={[styles.eventPickerSubtitle, { color: colors.textMuted }]}>
                Only ongoing events you've registered for are eligible for attendance.
              </Text>

              <ScrollView style={styles.eventList} showsVerticalScrollIndicator={false}>
                {myRegistrations.filter(r => {
                  if (!r.event || r.status === 'CANCELLED') return false;
                  
                  // Hide events that have already finished
                  const endDate = r.event.endDate ? new Date(r.event.endDate) : null;
                  if (endDate && now.getTime() > endDate.getTime()) return false;
                  
                  return true;
                }).map((reg) => {
                  const event = reg.event!;
                  const eventStartDate = new Date(event.date);
                  const eventEndDate = event.endDate ? new Date(event.endDate) : null;
                  
                  const hasStarted = now.getTime() >= eventStartDate.getTime();
                  const hasEnded = eventEndDate ? now.getTime() > eventEndDate.getTime() : false;
                  
                  const isOngoing = hasStarted && !hasEnded; 

                  return (
                    <Pressable
                      key={reg.id}
                      style={({ pressed }) => [
                        styles.eventItem,
                        { 
                          backgroundColor: theme === 'light' ? '#f8fafc' : '#1e293b',
                          opacity: pressed ? 0.7 : 1,
                          borderLeftColor: isOngoing ? colors.success : colors.border,
                          borderLeftWidth: 4,
                        }
                      ]}
                      onPress={() => {
                        if (isOngoing) {
                          startScanner(event);
                        } else if (!hasStarted) {
                          Alert.alert("Event Not Started", "This event has not started yet. You can mark attendance once it begins.");
                        } else {
                          Alert.alert("Event Ended", "This event has already ended. Attendance scanning is no longer allowed.");
                        }
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.eventItemName, { color: colors.text }]}>{event.name}</Text>
                        <View style={styles.eventItemMeta}>
                          <Calendar size={14} color={colors.textMuted} />
                          <Text style={[styles.eventItemDate, { color: colors.textMuted }]}>
                            {formatDate(eventStartDate)}
                          </Text>
                          <View style={{ width: 10 }} />
                          <Clock size={14} color={colors.textMuted} />
                          <Text style={[styles.eventItemDate, { color: colors.textMuted }]}>
                            {formatTime12h(eventStartDate)}
                          </Text>
                        </View>
                      </View>
                      
                      {isOngoing ? (
                        <View style={[styles.statusBadge, { backgroundColor: colors.success + '15' }]}>
                          <Text style={[styles.statusBadgeText, { color: colors.success }]}>Ongoing</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, { backgroundColor: colors.border + '30' }]}>
                          <Text style={[styles.statusBadgeText, { color: colors.textMuted }]}>Upcoming</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
                
                {myRegistrations.filter(r => r.status !== 'CANCELLED' && r.event).length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
                      You haven't registered for any active events yet.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentRegistrations}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{finishedRegistrations}</Text>
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
        {activeAnnouncements.length > 0 && (
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
                data={activeAnnouncements}
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
                        {formatDate(item.date)}
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
                    Math.min(currentIndex, activeAnnouncements.length - 1),
                  );
                }}
              />
            </View>
            {/* Indicator Dots */}
            <View style={styles.indicatorContainer}>
              {activeAnnouncements.map((_, index) => (
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
            {activeCount > 0 ? "Popular Events" : "Recent Events"}
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
                    { backgroundColor: item.status === 'Open' ? colors.secondary : colors.textMuted + '40' },
                  ]}
                >
                  <Text style={[styles.statusTagText, { color: item.status === 'Open' ? '#fff' : colors.textMuted }]}>
                    {item.status === 'Open' ? "Soon" : "Closed"}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {activeCount > 0 ? "Upcoming Deadlines" : "Past Events"}
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
                  <Text style={[styles.deadlineDate, { color: (event.status === 'Open' && (!event.deadline || new Date(event.deadline).getTime() > now.getTime())) ? colors.error : colors.textMuted }]}>
                    {(event.status === 'Open' && (!event.deadline || new Date(event.deadline).getTime() > now.getTime())) ? "Event Open" : "Event Closed"}
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
    ...Platform.select({
      web: {
        textShadow: '-1px 1px 10px rgba(0, 0, 0, 0.75)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
      }
    }),
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  eventPickerContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  eventPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventPickerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  eventPickerSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  eventList: {
    maxHeight: 400,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  eventItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  eventItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventItemDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
});
