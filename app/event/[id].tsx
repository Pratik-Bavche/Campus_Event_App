import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Award, Calendar, Clock, Info, MapPin, Share2, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/theme';
import { eventService } from '../../services/api';
import { Event } from '../../types';

const { width } = Dimensions.get('window');

export default function EventDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await eventService.getEventById(id as string);
                setEvent(data);
            } catch (error) {
                console.error('Fetch event detail error', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleDownloadCertificate = () => {
        Alert.alert(
            'Download Certificate',
            `Your certificate for ${event?.name} is being generated and will be downloaded shortly.`,
            [{ text: 'OK' }]
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Event not found</Text>
                <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
            </View>
        );
    }

    const isDeadlinePassed = new Date(event.deadline) < new Date();
    const canRegister = event.status === 'Open' && !isDeadlinePassed;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.imageContainer}>
                <Image source={{ uri: event.poster }} style={styles.poster} />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.overlay}
                />
                <View style={styles.topBar}>
                    <Pressable onPress={() => router.back()} style={styles.iconButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </Pressable>
                    <Pressable style={styles.iconButton}>
                        <Share2 color="#fff" size={24} />
                    </Pressable>
                </View>
                <View style={styles.headerContent}>
                    <View style={[styles.clubBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.clubText}>{event.club}</Text>
                    </View>
                    <Text style={styles.eventName}>{event.name}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={styles.statsGrid}>
                        <View style={styles.gridItem}>
                            <View style={styles.gridIconHeader}>
                                <Calendar size={20} color={colors.primary} />
                                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Date</Text>
                            </View>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {new Date(event.date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.gridItem}>
                            <View style={styles.gridIconHeader}>
                                <Clock size={20} color={colors.primary} />
                                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Time</Text>
                            </View>
                            <Text style={[styles.statValue, { color: colors.text }]}>
                                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
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
                                {event.registrationType === 'group' ? `${event.minGroupSize}-${event.maxGroupSize} People` : 'Individual'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                        <Text style={[styles.description, { color: colors.textMuted }]}>{event.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rules & Guidelines</Text>
                        <Card style={styles.rulesCard}>
                            <Text style={[styles.rules, { color: colors.text }]}>{event.rules}</Text>
                        </Card>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Club Representative</Text>
                        <Card style={styles.repCard}>
                            <View style={styles.repInfo}>
                                <View style={[styles.repAvatar, { backgroundColor: colors.primary + '20' }]}>
                                    <Users size={24} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.repClubName, { color: colors.text }]}>{event.club}</Text>
                                    <Text style={[styles.repMobile, { color: colors.primary }]}>{event.representativePhone}</Text>
                                </View>
                            </View>
                        </Card>
                    </View>

                    <View style={styles.deadlineInfo}>
                        <Info size={16} color={isDeadlinePassed ? colors.error : colors.accent} />
                        <Text style={[styles.deadlineText, { color: isDeadlinePassed ? colors.error : colors.accent }]}>
                            {isDeadlinePassed ? 'Registration closed' : `Register before ${new Date(event.deadline).toLocaleDateString()}`}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {new Date(event.date) <= new Date() ? (
                    <Button
                        title="Download Certificate"
                        onPress={handleDownloadCertificate}
                        style={{ ...styles.registerButton, backgroundColor: '#10b981' }}
                        icon={<Award size={20} color="#fff" />}
                    />
                ) : (
                    <Button
                        title={isDeadlinePassed ? "Registration Closed" : "Register Now"}
                        disabled={!canRegister}
                        onPress={() => router.push(`/register/${event.id}`)}
                        style={styles.registerButton}
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
        height: 350,
        width: width,
        position: 'relative',
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    topBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 65,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)', // Darker semi-transparent background
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContent: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
    },
    clubBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    clubText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    eventName: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    scrollContainer: {
        flex: 1,
        marginTop: -30,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: 24,
        paddingTop: 40,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        minHeight: 500,
    },
    statsGrid: {
        flexDirection: 'row',
        marginBottom: 24,
        gap: 12,
    },
    gridItem: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: 16,
        borderRadius: 16,
    },
    gridIconHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    rulesCard: {
        padding: 16,
    },
    rules: {
        fontSize: 14,
        lineHeight: 22,
    },
    repCard: {
        padding: 16,
    },
    repInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    repAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    repClubName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    repMobile: {
        fontSize: 18,
        fontWeight: '700',
    },
    deadlineInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    deadlineText: {
        fontSize: 14,
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
    },
    registerButton: {
        height: 56,
    }
});
