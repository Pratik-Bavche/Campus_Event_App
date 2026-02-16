import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Code, Plus, User, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
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
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/theme';
import { eventService } from '../../services/api';
import { useDataStore } from '../../store/useDataStore';
import { Event } from '../../types';

export default function RegistrationFlow() {
    const { id } = useLocalSearchParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [regType, setRegType] = useState<'individual' | 'group' | null>(null);
    const [groupAction, setGroupAction] = useState<'create' | 'join' | null>(null);
    const [groupCode, setGroupCode] = useState('');
    const [groupName, setGroupName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const addRegistration = useDataStore(state => state.addRegistration);

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

    const handleRegister = async () => {
        setIsSubmitting(true);
        try {
            let details = {};
            if (regType === 'group') {
                if (groupAction === 'create') {
                    if (!groupName) {
                        Alert.alert('Error', 'Please enter a group name');
                        setIsSubmitting(false);
                        return;
                    }
                    details = { groupName, groupAction: 'create' };
                } else {
                    if (!groupCode) {
                        Alert.alert('Error', 'Please enter a group code');
                        setIsSubmitting(false);
                        return;
                    }
                    details = { groupCode, groupAction: 'join' };
                }
            }

            const registration = await eventService.registerForEvent(id as string, details);
            addRegistration(registration);
            setSuccess(true);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (success) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
                    <CheckCircle size={60} color={colors.success} />
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backButtonIcon}>
                    <ArrowLeft color="#fff" size={24} />
                </Pressable>
                <Text style={styles.headerTitle}>Register</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.eventContext}>
                    <Text style={[styles.contextEventName, { color: colors.text }]}>{event?.name}</Text>
                    <Text style={[styles.contextClubName, { color: colors.primary }]}>{event?.club}</Text>
                </View>

                {!regType && (
                    <View style={styles.choiceSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Registration Type</Text>
                        <View style={styles.choiceRow}>
                            <Card
                                style={[
                                    styles.choiceCard,
                                    styles.individualCard,
                                    regType === 'individual' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                                ]}
                                onPress={() => setRegType('individual')}
                            >
                                <User size={48} color={regType === 'individual' ? colors.primary : colors.textMuted} />
                                <Text style={[styles.choiceText, styles.individualText, { color: colors.text }]}>Individual</Text>
                            </Card>
                            <Card
                                style={[
                                    styles.choiceCard,
                                    regType === 'group' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                                ]}
                                onPress={() => setRegType('group')}
                            >
                                <Users size={32} color={regType === 'group' ? colors.primary : colors.textMuted} />
                                <Text style={[styles.choiceText, { color: colors.text }]}>Group Registration</Text>
                            </Card>
                        </View>
                    </View>
                )}

                {regType === 'individual' && (
                    <View style={styles.formSection}>
                        <Text style={[styles.confirmText, { color: colors.text }]}>
                            Confirm your individual registration for this event.
                        </Text>
                        <Button
                            title="Confirm Registration"
                            onPress={handleRegister}
                            loading={isSubmitting}
                        />
                    </View>
                )}

                {regType === 'group' && !groupAction && (
                    <View style={styles.choiceSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Would you like to...</Text>
                        <View style={styles.choiceColumn}>
                            <Card
                                style={[styles.groupActionCard, { borderColor: colors.border }]}
                                onPress={() => setGroupAction('create')}
                            >
                                <View style={styles.choiceLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                        <Plus size={24} color={colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.groupActionTitle, { color: colors.text }]}>Create a New Group</Text>
                                        <Text style={[styles.groupActionDesc, { color: colors.textMuted }]}>Start a new team and invite others</Text>
                                    </View>
                                </View>
                            </Card>
                            <Card
                                style={[styles.groupActionCard, { borderColor: colors.border }]}
                                onPress={() => setGroupAction('join')}
                            >
                                <View style={styles.choiceLeft}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                                        <Code size={24} color={colors.accent} />
                                    </View>
                                    <View>
                                        <Text style={[styles.groupActionTitle, { color: colors.text }]}>Join via Code</Text>
                                        <Text style={[styles.groupActionDesc, { color: colors.textMuted }]}>Join an existing team using a code</Text>
                                    </View>
                                </View>
                            </Card>
                        </View>
                    </View>
                )}

                {regType === 'group' && groupAction === 'create' && (
                    <View style={styles.formSection}>
                        <Input
                            label="Group Name"
                            placeholder="Enter team name"
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                        <Text style={[styles.infoNote, { color: colors.textMuted }]}>
                            Team size: {event?.minGroupSize} - {event?.maxGroupSize} members
                        </Text>
                        <Button
                            title="Create & Register"
                            onPress={handleRegister}
                            loading={isSubmitting}
                        />
                        <Button
                            title="Back"
                            variant="outline"
                            onPress={() => setGroupAction(null)}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                )}

                {regType === 'group' && groupAction === 'join' && (
                    <View style={styles.formSection}>
                        <Input
                            label="Group Code"
                            placeholder="e.g. AB123XYZ"
                            value={groupCode}
                            onChangeText={setGroupCode}
                            autoCapitalize="characters"
                        />
                        <Button
                            title="Join & Register"
                            onPress={handleRegister}
                            loading={isSubmitting}
                        />
                        <Button
                            title="Back"
                            variant="outline"
                            onPress={() => setGroupAction(null)}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 16,
    },
    topHeader: {
        backgroundColor: '#3b82f6',
        paddingTop: Platform.OS === 'ios' ? 60 : 70, // Margin from top
        paddingBottom: 20,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButtonIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    eventContext: {
        marginBottom: 32,
        marginTop: 8,
    },
    contextEventName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    contextClubName: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 24,
        textAlign: 'center',
    },
    choiceSection: {
        marginBottom: 32,
    },
    choiceRow: {
        flexDirection: 'column',
        gap: 20,
    },
    choiceCard: {
        width: '100%',
        alignItems: 'center',
        padding: 32,
        gap: 16,
        borderWidth: 2,
    },
    individualCard: {
        padding: 40, // Larger padding for individual
    },
    choiceText: {
        fontSize: 18,
        fontWeight: '700',
    },
    individualText: {
        fontSize: 24, // Bigger font for individual
    },
    choiceColumn: {
        gap: 16,
    },
    groupActionCard: {
        padding: 16,
    },
    choiceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupActionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    groupActionDesc: {
        fontSize: 12,
    },
    formSection: {
        gap: 16,
    },
    confirmText: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    infoNote: {
        fontSize: 12,
        marginBottom: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    backButton: {
        width: '100%',
    }
});
