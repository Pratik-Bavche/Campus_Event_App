import axios from 'axios';
import { Config } from '../constants/Config';
import { Event, Notification, Registration, User } from '../types';
import { mockEvents, mockNotifications, mockRegistrations, mockUser } from './mockData';

// In a real app, this would be your base URL from env
const API_BASE_URL = Config.API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

// Mocking API responses for development
const isDevelopment = Config.IS_DEVELOPMENT;

export const authService = {
    login: async (email: string, rollNumber: string, password: string): Promise<{ token: string; user: User }> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network lag
            return { token: 'mock-jwt-token', user: mockUser };
        }
        const response = await api.post('/login', { email, rollNumber, password });
        return response.data;
    },
    register: async (email: string, rollNumber: string, password: string): Promise<{ token: string; user: User }> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { token: 'mock-jwt-token', user: { ...mockUser, email, rollNumber } };
        }
        const response = await api.post('/register', { email, rollNumber, password });
        return response.data;
    },
};

export const eventService = {
    getEvents: async (): Promise<Event[]> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return mockEvents;
        }
        const response = await api.get('/events');
        return response.data;
    },
    getEventById: async (id: string): Promise<Event> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const event = mockEvents.find(e => e.id === id);
            if (!event) throw new Error('Event not found');
            return event;
        }
        const response = await api.get(`/events/${id}`);
        return response.data;
    },
    registerForEvent: async (eventId: string, details: any): Promise<Registration> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const event = mockEvents.find(e => e.id === eventId);
            if (!event) throw new Error('Event not found');
            return {
                id: Math.random().toString(36).substr(2, 9),
                eventId,
                event,
                studentId: mockUser.id,
                registrationDate: new Date().toISOString(),
                status: 'confirmed',
                ...details,
            };
        }
        const response = await api.post(`/events/${eventId}/register`, details);
        return response.data;
    },
};

export const registrationService = {
    getMyRegistrations: async (): Promise<Registration[]> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return mockRegistrations;
        }
        const response = await api.get('/my-registrations');
        return response.data;
    },
    cancelRegistration: async (registrationId: string): Promise<void> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 800));
            return;
        }
        await api.delete(`/registrations/${registrationId}`);
    },
};

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockNotifications;
        }
        const response = await api.get('/notifications');
        return response.data;
    },
};

export const profileService = {
    getMe: async (): Promise<User> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockUser;
        }
        const response = await api.get('/me');
        return response.data;
    },
    updateProfile: async (data: Partial<User>): Promise<User> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { ...mockUser, ...data };
        }
        const response = await api.put('/me', data);
        return response.data;
    },
};

export default api;
