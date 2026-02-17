import axios from 'axios';
import { Config } from '../constants/Config';
import { Announcement, Event, Notification, Registration, User } from '../types';
import { mockAnnouncements, mockEvents, mockNotifications, mockRegistrations, mockUser } from './mockData';
import { supabase } from './supabase';

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
        // For testing: Use roll number to generate a consistent dummy email
        const internalEmail = `${rollNumber.toLowerCase()}@test.com`;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: internalEmail,
            password: password,
        });

        if (error) throw error;

        const { data: userData, error: userError } = await supabase
            .from('students')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError) throw userError;

        return { token: data.session?.access_token || '', user: userData as User };
    },
    register: async (email: string, rollNumber: string, password: string, name: string, department: string, year: string, phoneNumber: string): Promise<{ token: string; user: User }> => {
        // For testing: Use roll number to generate a consistent dummy email
        const internalEmail = `${rollNumber.toLowerCase()}@test.com`;

        const { data, error } = await supabase.auth.signUp({
            email: internalEmail,
            password: password,
        });

        if (error) throw error;

        // Convert FE/SE/TE/BE or string year to number 1-5
        let yearNumber = parseInt(year);
        if (isNaN(yearNumber)) {
            const yearMap: { [key: string]: number } = { 'FE': 1, 'SE': 2, 'TE': 3, 'BE': 4 };
            yearNumber = yearMap[year.toUpperCase()] || 1;
        }

        const newUser: User = {
            id: data.user?.id || '',
            full_name: name,
            roll_number: rollNumber,
            mobile_number: phoneNumber,
            department,
            year: yearNumber,
        };

        const { error: insertError } = await supabase
            .from('students')
            .insert([newUser]);

        if (insertError) throw insertError;

        return { token: data.session?.access_token || '', user: newUser };
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

export const announcementService = {
    getAnnouncements: async (): Promise<Announcement[]> => {
        if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockAnnouncements;
        }
        const response = await api.get('/announcements');
        return response.data;
    },
};

export const profileService = {
    getMe: async (): Promise<User> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data as User;
    },
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: updatedData, error } = await supabase
            .from('students')
            .update(data)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return updatedData as User;
    },
    uploadAvatar: async (uri: string): Promise<string> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const formData = new FormData();
        formData.append('file', {
            uri: uri,
            name: fileName,
            type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        } as any);

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, formData, {
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update student profile with new avatar URL
        await supabase
            .from('students')
            .update({ profile_image: data.publicUrl })
            .eq('id', user.id);

        return data.publicUrl;
    },
};

export default api;
