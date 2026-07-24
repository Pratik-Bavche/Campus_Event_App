import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";

import { Card } from "../components/ui/Card";
import { Colors } from "../constants/theme";
import { useDataStore } from "../store/useDataStore";
import { Registration } from "../types";

export default function FeedbackScreen() {
    const router = useRouter();
    const { eventId } = useLocalSearchParams();
    const theme = useColorScheme() ?? "light";
    const colors = Colors[theme];

    const {
        myRegistrations,
        fetchRegistrations,
        myFeedbacks,
        fetchFeedbacks,
        submitFeedback,
        isRegistrationsLoading,
    } = useDataStore();

    const [selectedEventId, setSelectedEventId] = useState<string | null>(
        (eventId as string) || null
    );
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        fetchRegistrations();
        fetchFeedbacks();

        const timer = setInterval(() => {
            setNow(new Date());
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (eventId) {
            setSelectedEventId(eventId as string);
        }
    }, [eventId]);

    const completedRegistrations = myRegistrations.filter((reg: Registration) => {
        return (
            reg.event &&
            new Date(reg.event.deadline) <= now &&
            reg.status !== "CANCELLED"
        );
    });

    const allCompleted = completedRegistrations;
    const selectedReg = allCompleted.find((r) => r.event_id === selectedEventId);
    const alreadySubmitted = myFeedbacks.some(f => f.event_id === selectedEventId);

    const handleSubmit = async () => {
        if (!selectedReg) {
            Alert.alert("Error", "Please select an event first.");
            return;
        }
        if (rating === 0) {
            Alert.alert("Error", "Please provide a rating.");
            return;
        }
        if (comment.trim() === "") {
            Alert.alert("Error", "Please enter a comment.");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitFeedback({
                event_id: selectedReg.event_id,
                student_name: selectedReg.name,
                student_email: selectedReg.email,
                roll_no: selectedReg.roll_no,
                rating: rating,
                comment: comment,
            });
            Alert.alert("Success", "Feedback submitted successfully", [
                { text: "OK", onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to submit feedback.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isRegistrationsLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.headerTitle}>Event Feedback</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Select Completed Event
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.eventSelector}
                >
                    {allCompleted.map((reg) => (
                        <Pressable
                            key={reg.id}
                            onPress={() => {
                                setSelectedEventId(reg.event_id);
                                setRating(0);
                                setComment("");
                            }}
                            style={[
                                styles.eventChip,
                                {
                                    backgroundColor:
                                        selectedEventId === reg.event_id
                                            ? colors.primary
                                            : colors.primary + "15",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.eventChipText,
                                    {
                                        color:
                                            selectedEventId === reg.event_id ? "#fff" : colors.primary,
                                    },
                                ]}
                            >
                                {reg.event?.name}
                            </Text>
                        </Pressable>
                    ))}
                    {allCompleted.length === 0 && (
                        <Text style={{ color: colors.textMuted }}>No completed events found.</Text>
                    )}
                </ScrollView>

                {selectedReg ? (
                    <Card style={styles.formCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{selectedReg.name}</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>Roll No</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{selectedReg.roll_no}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <View style={styles.infoColumn}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{selectedReg.email}</Text>
                            </View>
                            <View style={styles.infoColumn}>
                                <Text style={[styles.label, { color: colors.textMuted }]}>Event ID</Text>
                                <Text style={[styles.value, { color: colors.text }]}>{selectedReg.event_id.substring(0, 8)}...</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

                        {alreadySubmitted ? (
                            <View style={styles.alreadySubmittedContainer}>
                                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                                <Text style={[styles.alreadySubmittedText, { color: colors.text }]}>Feedback Given</Text>
                                <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 8 }}>
                                    You have already submitted feedback for this event. Thank you!
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>Rating</Text>
                                <View style={styles.ratingRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Pressable key={star} onPress={() => setRating(star)}>
                                            <Star
                                                size={32}
                                                color={star <= rating ? "#FFD700" : colors.textMuted + "40"}
                                                fill={star <= rating ? "#FFD700" : "transparent"}
                                            />
                                        </Pressable>
                                    ))}
                                </View>

                                <Text style={[styles.inputLabel, { color: colors.text }]}>Comment</Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            color: colors.text,
                                            borderColor: colors.border,
                                            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f9f9f9'
                                        },
                                    ]}
                                    placeholder="Share your experience..."
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    numberOfLines={4}
                                    value={comment}
                                    onChangeText={setComment}
                                />

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.submitButton,
                                        { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 },
                                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                                    )}
                                </Pressable>
                            </>
                        )}
                    </Card>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color={colors.textMuted + "40"} />
                        <Text style={{ color: colors.textMuted, marginTop: 16 }}>
                            Select an event above to provide feedback
                        </Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    eventSelector: {
        flexDirection: "row",
        marginBottom: 24,
    },
    eventChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    eventChipText: {
        fontWeight: "600",
        fontSize: 14,
    },
    formCard: {
        padding: 20,
        borderRadius: 20,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    infoColumn: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    textInput: {
        borderRadius: 12,
        padding: 16,
        height: 120,
        textAlignVertical: "top",
        borderWidth: 1,
        marginBottom: 24,
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 60,
    },
    alreadySubmittedContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    alreadySubmittedText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 12,
    }
});
