import axios from 'axios';
import { Config } from '../constants/Config';
import { Announcement, Event, Notification, Registration, User } from '../types';
import { supabase } from './supabase';

// In a real app, this would be your base URL from env
const API_BASE_URL = Config.API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

export const authService = {
    login: async (email: string, rollNumber: string, password: string): Promise<{ token: string; user: User }> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
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
        // Check if roll number already exists
        const { data: existingUser } = await supabase
            .from('students')
            .select('roll_number')
            .eq('roll_number', rollNumber)
            .single();

        if (existingUser) {
            throw new Error('Roll number already registered');
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: name,
                    roll_number: rollNumber,
                }
            }
        });

        if (error) throw error;
        if (!data.user) throw new Error('Registration failed: No user data');

        // Convert FE/SE/TE/BE or string year to number 1-5
        let yearNumber = parseInt(year);
        if (isNaN(yearNumber)) {
            const yearMap: { [key: string]: number } = { 'FE': 1, 'SE': 2, 'TE': 3, 'BE': 4 };
            yearNumber = yearMap[year.toUpperCase()] || 1;
        }

        const newUser: User = {
            id: data.user.id,
            full_name: name,
            email: email,
            roll_number: rollNumber,
            mobile_number: phoneNumber,
            department,
            year: yearNumber,
        };

        const { error: insertError } = await supabase
            .from('students')
            .insert([newUser]);

        if (insertError) {
            // If insert fails, we should ideally clean up the auth user, but for now just throw
            console.error('Error creating student profile:', insertError);
            throw new Error('Failed to create student profile: ' + insertError.message);
        }

        return { token: data.session?.access_token || '', user: newUser };
    },
};

export const eventService = {
    getEvents: async (): Promise<Event[]> => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date_time', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            throw error;
        }

        return data.map((e: any) => ({
            id: e.id,
            name: e.title,
            club: 'Student Club',
            clubId: e.club_id,
            description: e.description,
            rules: e.eligibility || 'No specific rules available.',
            venue: e.venue || 'To be announced',
            date: e.date_time,
            deadline: e.registration_deadline || e.date_time, // Fallback to event date if no deadline
            poster: e.poster_url || 'https://via.placeholder.com/400x200',
            isClosed: e.status !== 'ACTIVE',
            registrationType: 'individual', // Defaulting as logic needs clarification
            status: e.status === 'ACTIVE' ? 'Open' : 'Closed',
            maxCapacity: e.event_limit,
            representativePhone: e.contact_person || '',
        }));
    },
    getEventById: async (id: string): Promise<Event> => {
        const { data: e, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching event details:', error);
            throw error;
        }

        return {
            id: e.id,
            name: e.title,
            club: 'Student Club',
            clubId: e.club_id,
            description: e.description,
            rules: e.eligibility || 'No specific rules available.',
            venue: e.venue || 'To be announced',
            date: e.date_time,
            deadline: e.registration_deadline || e.date_time,
            poster: e.poster_url || 'https://via.placeholder.com/400x200',
            isClosed: e.status !== 'ACTIVE',
            registrationType: 'individual',
            status: e.status === 'ACTIVE' ? 'Open' : 'Closed',
            maxCapacity: e.event_limit,
            representativePhone: e.contact_person || '',
        };
    },
    registerForEvent: async (eventId: string, details: any): Promise<Registration> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) throw new Error('User not authenticated');

        // Fetch student profile details needed for registration table
        const { data: profile, error: profileError } = await supabase
            .from('students')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching student profile for registration:', profileError);
            throw new Error('Could not fetch student profile. Please update your profile first.');
        }

        const { data, error } = await supabase
            .from('registrations')
            .insert({
                event_id: eventId,
                roll_no: profile.roll_number,
                name: profile.full_name,
                email: user.email,
                department: profile.department,
                year: profile.year?.toString(),
                status: 'REGISTERED',
                ...details
            })
            .select(`
                *,
                events (*)
            `)
            .single();

        if (error) {
            console.error('Registration error:', error);
            throw error;
        }

        return {
            id: data.id,
            eventId: data.event_id,
            event: { ...data.events, name: data.events.title } as any,
            studentId: user.id,
            registrationDate: data.registered_at || new Date().toISOString(),
            status: 'confirmed',
        };
    },
};

export const registrationService = {
    getMyRegistrations: async (): Promise<Registration[]> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) return [];

        try {
            // Filter by email as per new schema
            const { data, error } = await supabase
                .from('registrations')
                .select(`
                    *,
                    events (*)
                `)
                .eq('email', user.email);

            if (error) {
                console.warn('Error fetching registrations:', error.message);
                return [];
            }

            return data.map((r: any) => ({
                id: r.id,
                eventId: r.event_id,
                studentId: user.id, // Consistent with frontend user state
                registrationDate: r.registered_at,
                status: r.status === 'REGISTERED' ? 'confirmed' : 'pending',
                event: {
                    id: r.events.id,
                    name: r.events.title,
                    club: 'Student Club',
                    clubId: r.events.club_id,
                    description: r.events.description,
                    rules: r.events.eligibility,
                    venue: r.events.venue,
                    date: r.events.date_time,
                    deadline: r.events.registration_deadline,
                    poster: r.events.poster_url,
                    isClosed: r.events.status !== 'ACTIVE',
                    registrationType: 'individual',
                    status: r.events.status === 'ACTIVE' ? 'Open' : 'Closed',
                    maxCapacity: r.events.event_limit,
                    representativePhone: r.events.contact_person
                }
            }));
        } catch (e) {
            console.warn('Exception fetching registrations:', e);
            return [];
        }
    },
    cancelRegistration: async (registrationId: string): Promise<void> => {
        const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', registrationId);

        if (error) throw error;
    },
};

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        // Attempt to fetch from notifications table if it exists
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Notifications table might not exist or empty', error);
            return [];
        }
        return data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.content || n.message,
            type: n.type || 'announcement',
            date: n.created_at,
            isRead: n.is_read || false
        }));
    },
};

export const announcementService = {
    getAnnouncements: async (): Promise<Announcement[]> => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Announcements table might not exist', error);
            return [];
        }
        return data.map((a: any) => ({
            id: a.id,
            clubId: a.club_id,
            title: a.title,
            content: a.content,
            eventId: a.event_id,
            date: a.created_at,
            pinned: a.pinned
        }));
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

        // Fetch the file from the URI and convert to ArrayBuffer
        // This is more reliable for Supabase Storage in React Native than FormData
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                upsert: true
            });

        if (uploadError) {
            console.error('Upload Error Details:', uploadError);
            if (uploadError.message.includes('row-level security') || uploadError.message.includes('new row violates')) {
                throw new Error('Permission Denied: Please enable "INSERT" policies for the "avatars" bucket in your Supabase Dashboard to allow uploads.');
            }
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update student profile with new avatar URL
        const { error: updateError } = await supabase
            .from('students')
            .update({ profile_image: data.publicUrl })
            .eq('id', user.id);

        if (updateError) {
            console.error('Profile Update Error:', updateError);
            throw updateError;
        }

        return data.publicUrl;
    },
};

export default api;

