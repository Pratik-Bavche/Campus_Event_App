import { useRouter } from 'expo-router';
import { ChevronRight, Info, LogOut, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useDataStore } from '../../store/useDataStore';

const { width } = Dimensions.get('window');

// Sub-components moved outside to prevent re-creation on render
const StatCard = ({ label, count, color, colors, pressed }: any) => (
    <View style={[
        styles.statCard,
        {
            backgroundColor: colors.card,
            transform: [{ scale: pressed ? 0.96 : 1 }],
            borderColor: pressed ? color : 'transparent',
            borderWidth: 1
        }
    ]}>
        <Text style={[styles.statCount, { color }]}>{count}</Text>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
);

const MenuItem = ({ icon: Icon, label, color, colors, onPress }: any) => (
    <Pressable
        onPress={onPress}
        style={({ pressed }) => [
            styles.menuItem,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
            pressed && { backgroundColor: colors.border + '50' }
        ]}
    >
        <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
    </Pressable>
);

const InfoField = ({ label, value, halfWidth = false, colors }: any) => (
    <View style={[styles.infoGroup, halfWidth && { width: '48%' }]}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
);

export default function ProfileScreen() {
    const { user, logout, updateUser } = useAuthStore();
    const { myRegistrations } = useDataStore();
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    // Stats calculation
    const registeredCount = myRegistrations?.filter(r => r.status !== 'cancelled').length || 0;
    const completedCount = myRegistrations?.filter(r => new Date(r.event.date) <= new Date() && r.status !== 'cancelled').length || 0;
    const cancelledCount = myRegistrations?.filter(r => r.status === 'cancelled').length || 0;

    // Edit Modal State
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        rollNumber: user?.rollNumber || '',
        phoneNumber: user?.phoneNumber || '+91 98765 43210',
        department: user?.department || 'Computer Science',
        year: user?.year || '3rd Year'
    });

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    }
                },
            ]
        );
    };

    const handleUpdateProfile = async () => {
        try {
            await updateUser(editForm);
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handleMenuPress = (label: string) => {
        switch (label) {
            case 'About':
                Alert.alert('About', 'College Events App v1.0.0\nDeveloped by the Tech Team.\n\nContact us: support@college.edu');
                break;
        }
    };

    const handleStatPress = (tabName: string) => {
        router.push({
            pathname: '/registrations',
            params: { tab: tabName }
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.primary }]}>
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <Pressable
                            onPress={() => {
                                setEditForm({
                                    name: user?.name || '',
                                    rollNumber: user?.rollNumber || '',
                                    phoneNumber: user?.phoneNumber || '+91 98765 43210',
                                    department: user?.department || 'Computer Science',
                                    year: user?.year || '3rd Year'
                                });
                                setEditModalVisible(true);
                            }}
                            hitSlop={15}
                            style={({ pressed }) => [
                                styles.editButton,
                                { transform: [{ scale: pressed ? 0.95 : 1 }] },
                                { opacity: pressed ? 0.7 : 1 }
                            ]}
                        >
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Content area */}
                <View style={styles.content}>
                    {/* Profile Card */}
                    <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarShadow}>
                                <Image
                                    source={{ uri: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80` }}
                                    style={styles.avatar}
                                />
                            </View>
                        </View>

                        <View style={styles.infoFields}>
                            <InfoField label="Full Name" value={user?.name || 'User'} colors={colors} />
                            <InfoField label="Email Address" value={user?.email || 'user@college.edu'} colors={colors} />
                            <InfoField label="Roll Number" value={user?.rollNumber || 'N/A'} colors={colors} />

                            <View style={styles.row}>
                                <InfoField label="Department" value={user?.department || 'Not Set'} halfWidth colors={colors} />
                                <InfoField label="Year" value={user?.year || 'Not Set'} halfWidth colors={colors} />
                            </View>

                            <InfoField label="Phone Number" value={user?.phoneNumber || 'Not Set'} colors={colors} />
                        </View>
                    </View>

                    {/* Stats Section */}
                    <View style={styles.statsRow}>
                        <Pressable style={{ width: '31%' }} onPress={() => handleStatPress('All')}>
                            {({ pressed }) => (
                                <StatCard label="Registered" count={registeredCount} color={colors.primary} colors={colors} pressed={pressed} />
                            )}
                        </Pressable>
                        <Pressable style={{ width: '31%' }} onPress={() => handleStatPress('Completed')}>
                            {({ pressed }) => (
                                <StatCard label="Completed" count={completedCount} color={colors.success} colors={colors} pressed={pressed} />
                            )}
                        </Pressable>
                        <Pressable style={{ width: '31%' }} onPress={() => handleStatPress('Cancelled')}>
                            {({ pressed }) => (
                                <StatCard label="Cancelled" count={cancelledCount} color={colors.error} colors={colors} pressed={pressed} />
                            )}
                        </Pressable>
                    </View>

                    {/* Menu Section */}
                    <View style={[styles.menuSection, { backgroundColor: colors.card }]}>
                        <MenuItem icon={Info} label="About" color="#3b82f6" colors={colors} onPress={() => handleMenuPress('About')} />
                    </View>

                    {/* Logout Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.logoutButton,
                            { backgroundColor: theme === 'light' ? '#fef2f2' : '#450a0a' },
                            { transform: [{ scale: pressed ? 0.98 : 1 }] },
                            pressed && { opacity: 0.8 }
                        ]}
                        onPress={handleLogout}
                    >
                        <LogOut size={20} color={colors.error} />
                        <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
                            <Pressable
                                onPress={() => setEditModalVisible(false)}
                                style={styles.closeButton}
                                hitSlop={15}
                            >
                                <X size={24} color={colors.text} />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Full Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                value={editForm.name}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textMuted}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Roll Number</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                value={editForm.rollNumber}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, rollNumber: text }))}
                                placeholder="Enter roll number"
                                placeholderTextColor={colors.textMuted}
                            />

                            <View style={styles.inputRow}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Department</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                        value={editForm.department}
                                        onChangeText={(text) => setEditForm(prev => ({ ...prev, department: text }))}
                                        placeholder="Dept"
                                        placeholderTextColor={colors.textMuted}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Year</Text>
                                    <View style={styles.yearSelectionGrid}>
                                        {['FE', 'SE', 'TE', 'BE'].map((yr) => (
                                            <Pressable
                                                key={yr}
                                                onPress={() => setEditForm(prev => ({ ...prev, year: yr }))}
                                                style={[
                                                    styles.yearChip,
                                                    { borderColor: colors.border },
                                                    editForm.year === yr && { backgroundColor: colors.primary, borderColor: colors.primary }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.yearChipText,
                                                    { color: colors.text },
                                                    editForm.year === yr && { color: '#fff' }
                                                ]}>{yr}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>Phone Number</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                value={editForm.phoneNumber}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, phoneNumber: text }))}
                                placeholder="Phone number"
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.textMuted}
                            />

                            <Button
                                title="Save Changes"
                                onPress={handleUpdateProfile}
                                style={styles.saveButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 180,
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    editButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    content: {
        paddingHorizontal: 20,
        marginTop: -60,
    },
    profileCard: {
        borderRadius: 20,
        padding: 24,
        paddingTop: 0,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        marginBottom: 20,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginTop: -40,
        marginBottom: 20,
    },
    avatarShadow: {
        padding: 4,
        borderRadius: 50,
        backgroundColor: '#fff',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    infoFields: {
        gap: 16,
    },
    infoGroup: {
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '100%',
        borderRadius: 18,
        paddingVertical: 18,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    statCount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    menuSection: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 16,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
    },
    saveButton: {
        marginTop: 16,
        marginBottom: 32,
    },
    yearSelectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    yearChip: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        minWidth: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    yearChipText: {
        fontSize: 13,
        fontWeight: 'bold',
    }
});
