import { create } from 'zustand';
import { eventService, notificationService, registrationService } from '../services/api';
import { Event, Notification, Registration } from '../types';

interface DataState {
    events: Event[];
    myRegistrations: Registration[];
    notifications: Notification[];
    isEventsLoading: boolean;
    isRegistrationsLoading: boolean;
    isNotificationsLoading: boolean;
    fetchEvents: () => Promise<void>;
    fetchRegistrations: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
    cancelRegistration: (id: string) => Promise<void>;
    addRegistration: (reg: Registration) => void;
    removeRegistration: (id: string) => void;
    markNotificationAsRead: (id: string) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
    events: [],
    myRegistrations: [],
    notifications: [],
    isEventsLoading: false,
    isRegistrationsLoading: false,
    isNotificationsLoading: false,

    fetchEvents: async () => {
        set({ isEventsLoading: true });
        try {
            const events = await eventService.getEvents();
            set({ events, isEventsLoading: false });
        } catch (error) {
            set({ isEventsLoading: false });
            console.error('Fetch events error', error);
        }
    },

    fetchRegistrations: async () => {
        set({ isRegistrationsLoading: true });
        try {
            const registrations = await registrationService.getMyRegistrations();
            set({ myRegistrations: registrations, isRegistrationsLoading: false });
        } catch (error) {
            set({ isRegistrationsLoading: false });
            console.error('Fetch registrations error', error);
        }
    },

    fetchNotifications: async () => {
        set({ isNotificationsLoading: true });
        try {
            const notifications = await notificationService.getNotifications();
            set({ notifications, isNotificationsLoading: false });
        } catch (error) {
            set({ isNotificationsLoading: false });
            console.error('Fetch notifications error', error);
        }
    },
    cancelRegistration: async (id) => {
        try {
            await registrationService.cancelRegistration(id);
            set((state) => ({
                myRegistrations: state.myRegistrations.map((reg) =>
                    reg.id === id ? { ...reg, status: 'cancelled' } : reg
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
