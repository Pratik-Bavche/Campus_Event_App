import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Camera, LogOut, Save, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
  Linking,
} from "react-native";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Colors } from "../../constants/theme";
import { profileService } from "../../services/api";
import { useAuthStore } from "../../store/useAuthStore";
import { useDataStore } from "../../store/useDataStore";
import { Certificate, User } from "../../types";

const { width } = Dimensions.get("window");

interface StatCardProps {
  label: string;
  count: number;
  color: string;
  colors: any;
  pressed: boolean;
}

const StatCard = ({ label, count, color, colors, pressed }: StatCardProps) => (
  <View
    style={[
      styles.statCard,
      {
        backgroundColor: colors.card,
        transform: [{ scale: pressed ? 0.96 : 1 }],
        borderColor: pressed ? color : "transparent",
        borderWidth: 1,
      },
    ]}
  >
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
  </View>
);



interface InfoFieldProps {
  label: string;
  value: string;
  halfWidth?: boolean;
  colors: any;
  isEditing?: boolean;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "phone-pad" | "numeric";
}

const InfoField = ({
  label,
  value,
  halfWidth = false,
  colors,
  isEditing = false,
  onChangeText,
  keyboardType = "default"
}: InfoFieldProps) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[styles.infoGroup, halfWidth && { width: isTablet ? "49%" : "48%" }]}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.editableInput, { color: colors.text, borderBottomColor: colors.primary + "80" }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoFocus={label === "Full Name"}
        />
      ) : (
        <Text style={[styles.infoValue, { color: colors.text, fontSize: isTablet ? 18 : 16 }]} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
};

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { user, logout, updateUser } = useAuthStore();
  const { myRegistrations, myCertificates, fetchCertificates, isCertificatesLoading } = useDataStore();
  const router = useRouter();
  const theme = useColorScheme() ?? "light";
  const colors = Colors[theme];

  const [now, setNow] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // 30 seconds

    if (user?.roll_number) {
      fetchCertificates(user.roll_number);
    }

    return () => clearInterval(timer);
  }, [user?.roll_number]);

  // Stats calculation
  const registeredCount =
    myRegistrations?.filter((r) => r.status !== "CANCELLED").length || 0;

  const completedCount =
    myRegistrations?.filter((r) => {
      if (!r.event || r.status === "CANCELLED") return false;
      const deadline = r.event.deadline || r.event.date;
      return new Date(deadline).getTime() <= now.getTime();
    }).length || 0;

  const cancelledCount =
    myRegistrations?.filter((r) => r.status === "CANCELLED").length || 0;

  const branchOptions = [
    { label: "Information Technology", value: "Information Technology" },
    { label: "Computer Engineering", value: "Computer Science" },
    {
      label: "Electronics and Telecommunication Engineering",
      value: "Electronics",
    },
    { label: "Mechanical Engineering", value: "Mechanical" },
    { label: "Civil Engineering", value: "Civil" },
    {
      label: "Instrumentation and Control Engineering",
      value: "Instrumentation and Control",
    },
    { label: "Robotics and Automation", value: "Robotics and Automation" },
    { label: "Chemical Engineering", value: "Chemical" },
    {
      label: "Artificial Intelligence and Data Science",
      value: "Artificial Intelligence and Data Science",
    },
  ];

  const [isCertsExpanded, setIsCertsExpanded] = useState(false);

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || "",
    roll_number: user?.roll_number || "",
    mobile_number: user?.mobile_number || "",
    department: user?.department || "",
    year: user?.year || 1,
    division: user?.division || "",
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    try {
      const updates = {
        ...editForm,
        year: typeof editForm.year === "number" ? editForm.year : 1,
      };
      await updateUser(updates as Partial<User>);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      try {
        const publicUrl = await profileService.uploadAvatar(
          result.assets[0].uri,
        );
        await updateUser({ profile_image: publicUrl });
        Alert.alert("Success", "Profile picture updated!");
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Error",
          'Failed to upload image. Make sure an "avatars" bucket exists in Supabase Storage and is public.',
        );
      }
    }
  };



  const handleStatPress = (tabName: string) => {
    router.push({
      pathname: "/registrations",
      params: { tab: tabName },
    });
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.headerGradient as any}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            {!isEditing ? (
              <Pressable
                onPress={() => {
                  setEditForm({
                    full_name: user?.full_name || "",
                    roll_number: user?.roll_number || "",
                    mobile_number: user?.mobile_number || "",
                    department: user?.department || "",
                    year: user?.year || 1,
                    division: user?.division || "",
                  });
                  setIsEditing(true);
                }}
                hitSlop={15}
                style={({ pressed }) => [
                  styles.editButton,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </Pressable>
            ) : (
              <View style={styles.headerActions}>
                <Pressable
                  onPress={() => setIsEditing(false)}
                  style={styles.cancelHeaderButton}
                >
                  <X size={20} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Content area */}
        <View style={[styles.content, { paddingHorizontal: isTablet ? 60 : 20 }]}>
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, padding: isTablet ? 32 : 24, paddingTop: 0 }]}>
            <View style={styles.avatarWrapper}>
              <Pressable onPress={handleImagePick} style={styles.avatarShadow}>
                <Image
                  source={{
                    uri: user?.profile_image && user.profile_image.length > 0
                      ? user.profile_image
                      : defaultAvatar,
                  }}
                  style={styles.avatar}
                />
                <View
                  style={[
                    styles.cameraIconContainer,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Camera size={16} color="#fff" />
                </View>
              </Pressable>
            </View>

            <View style={styles.infoFields}>
              <InfoField
                label="Full Name"
                value={isEditing ? editForm.full_name : (user?.full_name || "User")}
                colors={colors}
                isEditing={isEditing}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, full_name: text }))}
              />

              {isEditing ? (
                <>
                  <Select
                    label="Branch"
                    value={editForm.department}
                    onSelect={(val) => setEditForm(prev => ({ ...prev, department: val }))}
                    options={branchOptions}
                  />

                  <View style={styles.row}>
                    <InfoField
                      label="Roll Number"
                      value={editForm.roll_number}
                      colors={colors}
                      isEditing={true}
                      halfWidth
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, roll_number: text }))}
                    />
                    <InfoField
                      label="Phone Number"
                      value={editForm.mobile_number}
                      colors={colors}
                      isEditing={true}
                      halfWidth
                      keyboardType="phone-pad"
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, mobile_number: text }))}
                    />
                  </View>

                  <View style={{ marginTop: 4 }}>
                    <Select
                      label="Division"
                      value={editForm.division}
                      onSelect={(val) => setEditForm(prev => ({ ...prev, division: val }))}
                      options={[
                        { label: 'Division A', value: 'A' },
                        { label: 'Division B', value: 'B' },
                        { label: 'Division C', value: 'C' },
                      ]}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Year</Text>
                    <View style={styles.yearSelectionGrid}>
                      {[
                        { label: "FE", value: 1 },
                        { label: "SE", value: 2 },
                        { label: "TE", value: 3 },
                        { label: "BE", value: 4 },
                      ].map((yr) => (
                        <Pressable
                          key={yr.label}
                          onPress={() => setEditForm(prev => ({ ...prev, year: yr.value }))}
                          style={[
                            styles.yearChip,
                            { borderColor: colors.border, backgroundColor: colors.background },
                            editForm.year === yr.value && {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.yearChipText,
                              { color: colors.text },
                              editForm.year === yr.value && { color: "#fff" },
                            ]}
                          >
                            {yr.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <InfoField
                    label="Department"
                    value={user?.department || "Not Set"}
                    colors={colors}
                  />

                  <View style={styles.row}>
                    <InfoField
                      label="Division"
                      value={user?.division ? `Division ${user.division}` : "Not Set"}
                      halfWidth
                      colors={colors}
                    />
                    <InfoField
                      label="Year"
                      value={user?.year ? `${["", "FE", "SE", "TE", "BE"][user.year] || user.year} Year` : "Not Set"}
                      halfWidth
                      colors={colors}
                    />
                  </View>

                  <View style={styles.row}>
                    <InfoField
                      label="Roll Number"
                      value={user?.roll_number || "N/A"}
                      halfWidth
                      colors={colors}
                    />
                    <InfoField
                      label="Phone Number"
                      value={user?.mobile_number || "Not Set"}
                      halfWidth
                      colors={colors}
                    />
                  </View>
                </>
              )}

              {isEditing && (
                <Button
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  style={styles.saveButtonInline}
                  icon={<Save size={18} color="#fff" />}
                />
              )}
            </View>
          </View>

          {/* Stats Section - Hidden during editing to focus on form */}
          {!isEditing && (
            <>
              <View style={[styles.statsRow, { gap: isTablet ? 24 : 0 }]}>
                <Pressable
                  style={{ width: isTablet ? "31%" : "31%" }}
                  onPress={() => handleStatPress("All")}
                >
                  {({ pressed }) => (
                    <StatCard
                      label="Registered"
                      count={registeredCount}
                      color={colors.primary}
                      colors={colors}
                      pressed={pressed}
                    />
                  )}
                </Pressable>
                <Pressable
                  style={{ width: isTablet ? "31%" : "31%" }}
                  onPress={() => handleStatPress("Completed")}
                >
                  {({ pressed }) => (
                    <StatCard
                      label="Completed"
                      count={completedCount}
                      color={colors.success}
                      colors={colors}
                      pressed={pressed}
                    />
                  )}
                </Pressable>
                <Pressable
                  style={{ width: isTablet ? "31%" : "31%" }}
                  onPress={() => handleStatPress("Cancelled")}
                >
                  {({ pressed }) => (
                    <StatCard
                      label="Cancelled"
                      count={cancelledCount}
                      color={colors.error}
                      colors={colors}
                      pressed={pressed}
                    />
                  )}
                </Pressable>
              </View>

              {/* Certificate Card */}
              <View
                style={[styles.certificateCard, { backgroundColor: colors.card, padding: isTablet ? 32 : 22 }]}
              >
                <View style={styles.certificateHeaderRow}>
                  <Text style={[styles.certificateTitle, { color: colors.text, fontSize: isTablet ? 20 : 17 }]}>
                    Certificates
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text
                      style={[styles.certificateCount, { color: colors.primary, fontSize: isTablet ? 18 : 16 }]}
                    >
                      {myCertificates.length}
                    </Text>
                  </View>
                </View>
                
                <Text
                  style={[
                    styles.certificateDescription,
                    { color: colors.textMuted, marginBottom: 16 },
                  ]}
                >
                  Your earned certificates for completed events. Click the button below to view them.
                </Text>

                <Button 
                  title={isCertsExpanded ? "Hide Certificates" : "View Certificates"}
                  onPress={() => setIsCertsExpanded(!isCertsExpanded)}
                  variant="primary"
                  style={styles.viewCertsButton}
                />
                
                {isCertsExpanded && (
                  <View style={{ marginTop: 20 }}>
                    {myCertificates.length > 0 ? (
                      myCertificates.map((cert) => (
                        <Pressable
                          key={cert.id}
                          style={({ pressed }) => [
                            styles.certificateItem,
                            { 
                              backgroundColor: theme === 'light' ? '#f8fafc' : '#1e293b',
                              opacity: pressed ? 0.7 : 1,
                              transform: [{ scale: pressed ? 0.98 : 1 }]
                            }
                          ]}
                          onPress={() => Linking.openURL(cert.certificate_url)}
                        >
                          <View style={styles.certIconContainer}>
                            <Image 
                              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2912/2912761.png' }} 
                              style={styles.certIcon}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.certEventTitle, { color: colors.text }]}>{cert.event_title}</Text>
                            <Text style={[styles.certDate, { color: colors.textMuted }]}>
                              {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'Issued'}
                            </Text>
                          </View>
                          <Text style={{ color: colors.primary, fontWeight: '600' }}>View</Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={{ color: colors.textMuted, textAlign: 'center', padding: 10 }}>
                        No certificates available yet.
                      </Text>
                    )}
                  </View>
                )}
              </View>



              {/* Logout Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  { backgroundColor: theme === "light" ? "#fef2f2" : "#450a0a" },
                  { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={handleLogout}
              >
                <LogOut size={20} color={colors.error} />
                <Text style={[styles.logoutText, { color: colors.error }]}>
                  Logout
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 160,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  saveHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    paddingTop: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 20,
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 20,
  },
  avatarShadow: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  infoFields: {
    gap: 12,
  },
  infoGroup: {
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editableInput: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButtonInline: {
    marginTop: 20,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statCount: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  menuSection: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  yearSelectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  certificateCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  certificateHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  certificateTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  certificateCount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  certificateDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  certificateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  certIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  certIcon: {
    width: 24,
    height: 24,
  },
  certEventTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  certDate: {
    fontSize: 12,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewCertsButton: {
    borderRadius: 12,
    marginTop: 8,
  },
});
