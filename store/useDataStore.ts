import { create } from 'zustand';
import { announcementService, eventService, feedbackService, notificationService, registrationService } from '../services/api';
import { Announcement, Event, Feedback, Notification, Registration } from '../types';

interface DataState {
    events: Event[];
    myRegistrations: Registration[];
    myFeedbacks: Feedback[];
    notifications: Notification[];
    announcements: Announcement[];
    isEventsLoading: boolean;
    isRegistrationsLoading: boolean;
    isNotificationsLoading: boolean;
    isAnnouncementsLoading: boolean;
    isFeedbacksLoading: boolean;
    fetchEvents: () => Promise<void>;
    fetchRegistrations: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    fetchAnnouncements: () => Promise<void>;
    fetchFeedbacks: () => Promise<void>;
    submitFeedback: (feedback: Omit<Feedback, 'id' | 'created_at'>) => Promise<void>;
    cancelRegistration: (id: string) => Promise<void>;
    addRegistration: (reg: Registration) => void;
    removeRegistration: (id: string) => void;
    markNotificationAsRead: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
    events: [],
    myRegistrations: [],
    myFeedbacks: [],
    notifications: [],
    announcements: [],
    isEventsLoading: false,
    isRegistrationsLoading: false,
    isNotificationsLoading: false,
    isAnnouncementsLoading: false,
    isFeedbacksLoading: false,

    fetchEvents: async () => {
        set({ isEventsLoading: true });
        try {
            const events = await eventService.getEvents();
            set({ events, isEventsLoading: false });
        } catch (error: any) {
            set({ isEventsLoading: false });
            const message = error?.message || '';
            // Using console.log instead of warn/error for these to avoid dev-mode popups while notifying logs
            if (message.includes('525') || message.includes('Connection error')) {
                console.log('Handled gracefuly:', message);
            } else {
                console.warn('Fetch events error', error);
            }
        }
    },

    fetchRegistrations: async () => {
        set({ isRegistrationsLoading: true });
        try {
            const registrations = await registrationService.getMyRegistrations();
            set({ myRegistrations: registrations, isRegistrationsLoading: false });
        } catch (error: any) {
            set({ isRegistrationsLoading: false });
            const message = error?.message || '';
            if (message.includes('525') || message.includes('Connection error')) {
                console.log('Handled gracefuly:', message);
            } else {
                console.warn('Fetch registrations error', error);
            }
        }
    },

    fetchNotifications: async () => {
        set({ isNotificationsLoading: true });
        try {
            const notifications = await notificationService.getNotifications();
            set({ notifications, isNotificationsLoading: false });
        } catch (error: any) {
            set({ isNotificationsLoading: false });
            const message = error?.message || '';
            if (message.includes('525') || message.includes('Connection error')) {
                console.log('Handled gracefuly:', message);
            } else {
                console.warn('Fetch notifications error', error);
            }
        }
    },

    fetchAnnouncements: async () => {
        set({ isAnnouncementsLoading: true });
        try {
            const announcements = await announcementService.getAnnouncements();
            set({ announcements, isAnnouncementsLoading: false });
        } catch (error: any) {
            set({ isAnnouncementsLoading: false });
            const message = error?.message || '';
            if (message.includes('525') || message.includes('Connection error')) {
                console.log('Handled gracefuly:', message);
            } else {
                console.warn('Fetch announcements error', error);
            }
        }
    },

    fetchFeedbacks: async () => {
        set({ isFeedbacksLoading: true });
        try {
            const feedbacks = await feedbackService.getMyFeedbacks();
            set({ myFeedbacks: feedbacks, isFeedbacksLoading: false });
        } catch (error) {
            set({ isFeedbacksLoading: false });
            console.warn('Fetch feedbacks error', error);
        }
    },

    submitFeedback: async (feedbackData) => {
        try {
            const feedback = await feedbackService.submitFeedback(feedbackData);
            set((state) => ({
                myFeedbacks: [...state.myFeedbacks, feedback],
            }));
        } catch (error) {
            console.error('Submit feedback error', error);
            throw error;
        }
    },
    cancelRegistration: async (id) => {
        try {
            await registrationService.cancelRegistration(id);
            set((state) => ({
                myRegistrations: state.myRegistrations.map((reg) =>
                    reg.id === id ? { ...reg, status: 'CANCELLED' } : reg
                ),
            }));
        } catch (error) {
            console.error('Cancel registration error', error);
            throw error;
        }
    },

    addRegistration: (reg) => {
        set((state) => ({
            myRegistrations: [reg, ...state.myRegistrations],
        }));
    },
    removeRegistration: (id) => {
        set((state) => ({
            myRegistrations: state.myRegistrations.filter((reg) => reg.id !== id),
        }));
    },

    markNotificationAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        }));
    },
}));
