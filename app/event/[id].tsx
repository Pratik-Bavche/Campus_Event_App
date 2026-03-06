import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Award,
  Calendar,
  Clock,
  Info,
  MapPin,
  Share2,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/theme";
import { eventService } from "../../services/api";
import { shareService } from "../../services/shareService";
import { useDataStore } from "../../store/useDataStore";
import { Event } from "../../types";

export default function EventDetailsScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const params = useLocalSearchParams();
  const rawId = params.id as string;

  const getValidEventId = (id: string | undefined): string | null => {
    if (!id) return null;
    if (id.includes(":") || id.includes("10.") || id.includes("192.")) return null;
    const cleanId = id.split("?")[0].split("#")[0].trim();
    if (cleanId && (cleanId.length === 36 || /^[0-9a-f-]+$/i.test(cleanId) || /^\d+$/.test(cleanId))) {
      return cleanId;
    }
    return null;
  };

  const validId = getValidEventId(rawId);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const { myRegistrations, fetchRegistrations, addRegistration } = useDataStore();

  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  useEffect(() => {
    const fetchEvent = async () => {
      if (!validId) {
        setError("Invalid event ID");
        setIsLoading(false);
        return;
      }
      try {
        const data = await eventService.getEventById(validId);
        setEvent(data);
        setError(null);
      } catch (fetchError) {
        setError("Failed to load event details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [validId]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleDownloadCertificate = () => {
    Alert.alert(
      "Download Certificate",
      `Your certificate for ${event?.name} is being generated and will be downloaded shortly.`,
      [{ text: "OK" }],
    );
  };

  const handleRegisterClick = async () => {
    if (!event) return;

    const registationType = event.registrationType as 'individual' | 'group' | 'both';

    // Case 1: INDIVIDUAL - Register immediately
    if (registationType === 'individual') {
      setIsRegistering(true);
      try {
        const registration = await eventService.registerForEventImmediate(event.id);
        addRegistration(registration);
        setRegistrationSuccess(true);
        setRegistrationError(null);
      } catch (err: any) {
        setRegistrationError(err.message || 'Registration failed. Please try again.');
        setIsRegistering(false);
      }
    }
    // Case 2: TEAM - Navigate to registration page with group-only mode
    else if (registationType === 'group') {
      router.push(`/register/${event.id}?mode=group`);
    }
    // Case 3: BOTH - Navigate to registration page with both options
    else if (registationType === 'both') {
      router.push(`/register/${event.id}`);
    }
  };

  const handleShareEvent = async () => {
    if (!event) return;
    try {
      await shareService.shareEvent(event.id, event.name, event.description);
    } catch (error) {
      Alert.alert("Error", "Failed to share event. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (registrationSuccess) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
          <Award size={60} color={colors.success} />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>Registration Successful!</Text>
        <Text style={[styles.successMessage, { color: colors.textMuted }]}>
          You have successfully registered for {event?.name}. You can view your registration details in the "My Registrations" tab.
        </Text>
        <Button
          title="Back to Home"
          onPress={() => router.replace('/(tabs)')}
          style={styles.backButton}
        />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, fontSize: 16, marginBottom: 16, textAlign: "center" }}>
          {error || "Event not found"}
        </Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const isDeadlinePassed = new Date(event.deadline) < new Date();
  const isEventCompleted = new Date(event.date) < new Date() && new Date(event.deadline) < new Date();
  const isRegistered = myRegistrations.some((r) => r.event_id == event.id);
  const canRegister = event.status === "Open" && !isDeadlinePassed && !isRegistered;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.imageContainer, { height: isTablet ? 450 : 350 }]}>
        <Image source={{ uri: event.poster || 'https://via.placeholder.com/400x200' }} style={styles.poster} />
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.8)"]}
          style={styles.overlay}
        />
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ArrowLeft color="#fff" size={24} />
          </Pressable>
          <Pressable onPress={handleShareEvent} style={styles.iconButton}>
            <Share2 color="#fff" size={24} />
          </Pressable>
        </View>
        <View style={[styles.headerContent, { paddingHorizontal: isTablet ? 60 : 20, bottom: isTablet ? 50 : 30 }]}>
          <View style={[styles.clubBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.clubText}>{event.club}</Text>
          </View>
          <Text style={[styles.eventName, { fontSize: isTablet ? 44 : 32 }]}>{event.name}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { backgroundColor: colors.background, paddingHorizontal: isTablet ? 60 : 24 }]}>
          <View style={[styles.statsGrid, { marginBottom: isTablet ? 32 : 24, gap: isTablet ? 20 : 12 }]}>
            <View style={styles.gridItem}>
              <View style={styles.gridIconHeader}>
                <Calendar size={20} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Date</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text, fontSize: isTablet ? 18 : 16 }]}>
                {new Date(event.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.gridIconHeader}>
                <Clock size={20} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Time</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text, fontSize: isTablet ? 18 : 16 }]}>
                {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Text>
            </View>
            {isTablet && (
              <View style={styles.gridItem}>
                <View style={styles.gridIconHeader}>
                  <MapPin size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Venue</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text, fontSize: 18 }]} numberOfLines={2}>
                  {event.venue}
                </Text>
              </View>
            )}
            {isTablet && (
              <View style={styles.gridItem}>
                <View style={styles.gridIconHeader}>
                  <Users size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Type</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text, fontSize: 18 }]}>
                  {event.registrationType === "group" ? `${event.minGroupSize}-${event.maxGroupSize}` : "Individual"}
                </Text>
              </View>
            )}
          </View>

          {!isTablet && (
            <View style={[styles.statsGrid, { gap: 12 }]}>
              <View style={styles.gridItem}>
                <View style={styles.gridIconHeader}>
                  <MapPin size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Venue</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={2}>
                  {event.venue}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <View style={styles.gridIconHeader}>
                  <Users size={20} color={colors.primary} />
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Type</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {event.registrationType === "group" ? `${event.minGroupSize}-${event.maxGroupSize} People` : "Individual"}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: isTablet ? 22 : 18 }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textMuted, fontSize: isTablet ? 17 : 15 }]}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: isTablet ? 22 : 18 }]}>Rules & Guidelines</Text>
            <Card style={styles.rulesCard}>
              <Text style={[styles.rules, { color: colors.text, fontSize: isTablet ? 16 : 14 }]}>{event.rules}</Text>
            </Card>
          </View>

          <View style={[styles.section, isTablet && { width: '50%' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: isTablet ? 22 : 18 }]}>Club Representative</Text>
            <Card style={styles.repCard}>
              <View style={styles.repInfo}>
                <View style={[styles.repAvatar, { backgroundColor: colors.primary + "20" }]}>
                  <Users size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.repClubName, { color: colors.text, fontSize: isTablet ? 18 : 16 }]}>{event.club}</Text>
                  <Text style={[styles.repMobile, { color: colors.primary, fontSize: isTablet ? 20 : 18 }]}>{event.representativePhone}</Text>
                </View>
              </View>
            </Card>
          </View>

          <View style={styles.deadlineInfo}>
            <Info size={16} color={isDeadlinePassed ? colors.error : colors.accent} />
            <Text style={[styles.deadlineText, { color: isDeadlinePassed ? colors.error : colors.accent }]}>
              {isDeadlinePassed ? "Registration closed" : `Register before ${new Date(event.deadline).toLocaleDateString()}`}
            </Text>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingHorizontal: isTablet ? 60 : 20, paddingBottom: Platform.OS === "ios" ? 40 : 20 }]}>
        {registrationError && (
          <Text style={[styles.errorMessage, { color: colors.error, marginBottom: 12 }]}>
            {registrationError}
          </Text>
        )}
        {isRegistered && isEventCompleted ? (
          <Button title="Download Certificate" onPress={handleDownloadCertificate} style={{ ...styles.registerButton, backgroundColor: "#10b981", height: isTablet ? 64 : 56 }} icon={<Award size={20} color="#fff" />} />
        ) : isRegistered ? (
          <Button title="Already Registered" disabled={true} onPress={() => { }} style={{ ...styles.registerButton, opacity: 0.7, height: isTablet ? 64 : 56 }} />
        ) : isDeadlinePassed ? (
          <Button title="Registration Closed" disabled={true} onPress={() => { }} style={{ ...styles.registerButton, opacity: 0.7, height: isTablet ? 64 : 56 }} />
        ) : (
          <Button 
            title="Register Now" 
            disabled={!canRegister || isRegistering} 
            onPress={handleRegisterClick} 
            loading={isRegistering}
            style={{ ...styles.registerButton, height: isTablet ? 64 : 56 }} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 65,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  clubBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  clubText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  eventName: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 500,
  },
  statsGrid: {
    flexDirection: "row",
  },
  gridItem: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.03)",
    padding: 16,
    borderRadius: 16,
  },
  gridIconHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statValue: {
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
  },
  rulesCard: {
    padding: 16,
  },
  rules: {
    lineHeight: 22,
  },
  repCard: {
    padding: 16,
  },
  repInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  repAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  repClubName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  repMobile: {
    fontWeight: "700",
  },
  deadlineInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  backButton: {
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  registerButton: {
  },
});
