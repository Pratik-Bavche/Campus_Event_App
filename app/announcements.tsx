import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Megaphone } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';
import { Colors } from '../constants/theme';
import { useDataStore } from '../store/useDataStore';

export default function AnnouncementsScreen() {
    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];
    const { announcements, fetchAnnouncements, isAnnouncementsLoading } = useDataStore();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const renderAnnouncement = ({ item }: { item: any }) => (
        <View
            style={[
                styles.announcementCard,
                {
                    backgroundColor: '#fff7ed',
                    borderColor: '#fdba74',
                    borderLeftWidth: 4,
                    borderLeftColor: '#f97316'
                }
            ]}
        >
            <View style={[
                styles.announcementIcon,
                {
                    backgroundColor: '#f97316'
                }
            ]}>
                {item.pinned ? (
                    <Megaphone size={20} color="#fff" />
                ) : (
                    <Megaphone size={20} color="#fff" />
                )}
            </View>
            <View style={styles.announcementTextContent}>
                <View style={styles.headerRow}>
                    <Text style={[styles.announcementTitle, { color: colors.text, flex: 1 }]}>
                        {item.pinned && "📌 "}{item.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={[styles.announcementBody, { color: colors.textMuted }]}>
                    {item.content}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Announcements',
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.text,
                    headerLeft: () => (
                        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
                            <ArrowLeft size={24} color={colors.text} />
                        </Pressable>
                    )
                }}
            />

            <FlatList
                data={announcements}
                renderItem={renderAnnouncement}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshing={isAnnouncementsLoading}
                onRefresh={fetchAnnouncements}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ color: colors.textMuted }}>No announcements found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 24,
        gap: 16,
    },
    announcementCard: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        borderWidth: 1,
    },
    announcementIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f97316',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    announcementTextContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
        gap: 8,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    announcementBody: {
        fontSize: 14,
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    }
});
