import axios from 'axios';
import { Config } from '../constants/Config';
import { Announcement, Attendance, Certificate, Event, Feedback, Notification, Registration, User } from '../types';
import { supabase } from './supabase';

// In a real app, this would be your base URL from env
const API_BASE_URL = Config.API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

/**
 * Handle Supabase and network errors gracefully
 */
const handleApiError = (error: any, context: string) => {
    const message = error?.message || 'Unknown error';

    // 1. Check for specific Supabase Auth errors
    if (message.includes('Invalid login credentials') || message.includes('Email not confirmed')) {
        const errorMsg = 'Invalid email or password. Please try again.';
        console.log(`${context}: ${errorMsg}`);
        throw new Error(errorMsg);
    }

    if (message.includes('User already registered') || message.includes('User already exists')) {
        const errorMsg = 'An account with this email already exists.';
        console.log(`${context}: ${errorMsg}`);
        throw new Error(errorMsg);
    }


    if (message.toLowerCase().includes('network error') || message.toLowerCase().includes('failed to fetch')) {
        const errorMsg = 'Connection error. Please check your internet connection.';
        console.warn(`${context}: ${errorMsg}`);
        throw new Error(errorMsg);
    }

    // 3. Fallback: Log as info to avoid overlay, then rethrow
    console.log(`${context}:`, message);
    throw error;
};

export const authService = {
    login: async (email: string, rollNumber: string, password: string): Promise<{ token: string; user: User }> => {
        try {
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
        } catch (error) {
            return handleApiError(error, 'authService.login');
        }
    },
    register: async (email: string, rollNumber: string, password: string, name: string, department: string, year: string, phoneNumber: string, division: string): Promise<{ token: string; user: User }> => {
        try {
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
                division,
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
        } catch (error) {
            return handleApiError(error, 'authService.register');
        }
    },
};

/**
 * Map database registration_type values to frontend values
 */
const mapRegistrationType = (dbValue: string): 'individual' | 'group' | 'both' => {
    const typeMap: Record<string, 'individual' | 'group' | 'both'> = {
        'INDIVIDUAL': 'individual',
        'TEAM': 'group',
        'BOTH': 'both'
    };
    return typeMap[dbValue?.toUpperCase()] || 'both'; // Default to 'both' if not specified
};

export const eventService = {
    getEvents: async (): Promise<Event[]> => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date_time', { ascending: true });

            if (error) throw error;

            if (!data) return [];

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
                registrationType: mapRegistrationType(e.registration_type),
                status: e.status === 'ACTIVE' ? 'Open' : 'Closed',
                maxCapacity: e.event_limit,
                representativePhone: e.contact_person || '',
            }));
        } catch (error) {
            return handleApiError(error, 'eventService.getEvents');
        }
    },
    getEventById: async (id: string): Promise<Event> => {
        try {
            const { data: e, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

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
                registrationType: mapRegistrationType(e.registration_type),
                status: e.status === 'ACTIVE' ? 'Open' : 'Closed',
                maxCapacity: e.event_limit,
                representativePhone: e.contact_person || '',
            };
        } catch (error) {
            return handleApiError(error, 'eventService.getEventById');
        }
    },
    registerForEvent: async (eventId: string, details: Record<string, any>): Promise<Registration> => {
        try {
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

            // Check for existing registration
            const { data: existingReg } = await supabase
                .from('registrations')
                .select('id')
                .eq('event_id', eventId)
                .eq('email', user.email)
                .neq('status', 'CANCELLED')
                .single();

            if (existingReg) {
                throw new Error('You are already registered for this event.');
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
                    division: profile.division,
                    status: 'REGISTERED',
                    ...details
                })
                .select(`
                    *,
                    events (*)
                `)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                event_id: data.event_id,
                student_id: user.id,
                roll_no: data.roll_no,
                name: data.name,
                email: data.email,
                department: data.department,
                year: data.year,
                status: data.status,
                registered_at: data.registered_at,
                event: {
                    id: data.events.id,
                    name: data.events.title,
                    club: 'Student Club', // Or from events data if available
                    clubId: data.events.club_id,
                    description: data.events.description,
                    rules: data.events.eligibility,
                    venue: data.events.venue,
                    date: data.events.date_time,
                    deadline: data.events.registration_deadline || data.events.date_time,
                    poster: data.events.poster_url,
                    isClosed: data.events.status !== 'ACTIVE',
                    registrationType: 'individual',
                    status: data.events.status === 'ACTIVE' ? 'Open' : 'Closed',
                    maxCapacity: data.events.event_limit,
                    representativePhone: data.events.contact_person
                } as any,
            };
        } catch (error) {
            return handleApiError(error, 'eventService.registerForEvent');
        }
    },
    registerForEventImmediate: async (eventId: string): Promise<Registration> => {
        try {
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

            // Check for existing registration
            const { data: existingReg } = await supabase
                .from('registrations')
                .select('id')
                .eq('event_id', eventId)
                .eq('email', user.email)
                .neq('status', 'CANCELLED')
                .single();

            if (existingReg) {
                throw new Error('You are already registered for this event.');
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
                    division: profile.division,
                    status: 'REGISTERED',
                })
                .select(`
                    *,
                    events (*)
                `)
                .single();

            if (error) throw error;

            return {
                id: data.id,
                event_id: data.event_id,
                student_id: user.id,
                roll_no: data.roll_no,
                name: data.name,
                email: data.email,
                department: data.department,
                year: data.year,
                status: data.status,
                registered_at: data.registered_at,
                event: {
                    id: data.events.id,
                    name: data.events.title,
                    club: 'Student Club',
                    clubId: data.events.club_id,
                    description: data.events.description,
                    rules: data.events.eligibility,
                    venue: data.events.venue,
                    date: data.events.date_time,
                    deadline: data.events.registration_deadline || data.events.date_time,
                    poster: data.events.poster_url,
                    isClosed: data.events.status !== 'ACTIVE',
                    registrationType: mapRegistrationType(data.events.registration_type),
                    status: data.events.status === 'ACTIVE' ? 'Open' : 'Closed',
                    maxCapacity: data.events.event_limit,
                    representativePhone: data.events.contact_person
                } as any,
            };
        } catch (error) {
            return handleApiError(error, 'eventService.registerForEventImmediate');
        }
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

            if (!data) return [];
            return data.map((r: any) => {
                const eventData = r.events || r.event; // Handle both plural and singular relations
                return {
                    id: r.id,
                    event_id: r.event_id,
                    student_id: user.id,
                    roll_no: r.roll_no,
                    name: r.name,
                    email: r.email,
                    department: r.department,
                    year: r.year,
                    status: r.status,
                    registered_at: r.registered_at,
                    event: eventData ? {
                        id: eventData.id,
                        name: eventData.title,
                        club: 'Student Club',
                        clubId: eventData.club_id,
                        description: eventData.description,
                        rules: eventData.eligibility,
                        venue: eventData.venue,
                        date: eventData.date_time,
                        deadline: eventData.registration_deadline || eventData.date_time,
                        poster: eventData.poster_url,
                        isClosed: eventData.status !== 'ACTIVE',
                        registrationType: 'individual',
                        status: eventData.status === 'ACTIVE' ? 'Open' : 'Closed',
                        maxCapacity: eventData.event_limit,
                        representativePhone: eventData.contact_person
                    } : undefined
                };
            });
        } catch (e) {
            console.warn('Exception fetching registrations:', e);
            return [];
        }
    },
    cancelRegistration: async (registrationId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('registrations')
                .delete()
                .eq('id', registrationId);

            if (error) throw error;
        } catch (error) {
            handleApiError(error, 'registrationService.cancelRegistration');
        }
    },
};

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        try {
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
        } catch (error) {
            // Notifications are not critical, so we return empty instead of failing
            console.warn('getNotifications failed', error);
            return [];
        }
    },
};

export const announcementService = {
    getAnnouncements: async (): Promise<Announcement[]> => {
        try {
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
        } catch (error) {
            console.warn('getAnnouncements failed', error);
            return [];
        }
    },
};

export const profileService = {
    getMe: async (): Promise<User> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return data as User;
        } catch (error) {
            return handleApiError(error, 'profileService.getMe');
        }
    },
    updateProfile: async (data: Partial<User>): Promise<User> => {
        try {
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
        } catch (error) {
            return handleApiError(error, 'profileService.updateProfile');
        }
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

export const attendanceService = {
    markAttendance: async (rawEventId: string, scanMethod: 'QR' | 'MANUAL' = 'QR'): Promise<Attendance> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) throw new Error('User not authenticated');

            // Extract UUID from potential URL (e.g., http://localhost:3000/attendance/UUID?...)
            let eventId = rawEventId;
            const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
            const match = rawEventId.match(uuidRegex);
            if (match) {
                eventId = match[0];
            } else {
                console.warn('No UUID found in scanned data:', rawEventId);
                throw new Error('Invalid QR Code: No valid event ID found.');
            }

            // Fetch student profile details needed for attendance table
            const { data: profile, error: profileError } = await supabase
                .from('students')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                console.error('Error fetching student profile for attendance:', profileError);
                throw new Error('Could not fetch student profile. Please update your profile first.');
            }

            const attendanceData = {
                event_id: eventId,
                student_id: user.id,
                prn: profile.roll_number, // User context suggests roll_number is used as the primary identifier
                roll_number: profile.roll_number,
                name: profile.full_name,
                email: user.email,
                department: profile.department,
                year: profile.year?.toString(),
                division: profile.division,
                status: 'PRESENT',
                scan_method: scanMethod,
                timestamp: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('attendance')
                .insert(attendanceData)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('Attendance already marked for this event.');
                }
                throw error;
            }

            return data as Attendance;
        } catch (error) {
            return handleApiError(error, 'attendanceService.markAttendance');
        }
    },
    getEventAttendance: async (eventId: string): Promise<Attendance[]> => {
        try {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('event_id', eventId);

            if (error) throw error;
            return data as Attendance[];
        } catch (error) {
            return handleApiError(error, 'attendanceService.getEventAttendance');
        }
    }
};


export const feedbackService = {
    submitFeedback: async (feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback> => {
        try {
            const { data, error } = await supabase
                .from('feedback')
                .insert([feedback])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new Error('You have already submitted feedback for this event.');
                }
                throw error;
            }

            return data as Feedback;
        } catch (error) {
            return handleApiError(error, 'feedbackService.submitFeedback');
        }
    },
    getFeedbackForEvent: async (eventId: string, email: string): Promise<Feedback | null> => {
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .eq('event_id', eventId)
                .eq('student_email', email)
                .maybeSingle();

            if (error) throw error;
            return data as Feedback | null;
        } catch (error) {
            console.warn('getFeedbackForEvent failed', error);
            return null;
        }
    },
    getMyFeedbacks: async (): Promise<Feedback[]> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) return [];

            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .eq('student_email', user.email);

            if (error) throw error;
            return data as Feedback[];
        } catch (error) {
            console.warn('getMyFeedbacks failed', error);
            return [];
        }
    }
};

export const certificateService = {
    getMyCertificates: async (rollNo: string): Promise<Certificate[]> => {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('roll_no', rollNo);

            if (error) {
                console.warn('Error fetching certificates:', error.message);
                return [];
            }

            return data as Certificate[];
        } catch (error) {
            console.warn('getMyCertificates failed', error);
            return [];
        }
    }
};

export default api;


