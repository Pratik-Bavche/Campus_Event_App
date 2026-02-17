import { User } from '../types';
import { supabase } from './supabase';

export const studentService = {
    /**
     * Get a student's profile by their ID (usually the Supabase Auth user ID)
     */
    getProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching student profile:', error);
            throw error;
        }
        return data as User;
    },

    /**
     * Update a student's profile information
     */
    updateProfile: async (userId: string, updates: Partial<User>) => {
        const { data, error } = await supabase
            .from('students')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating student profile:', error);
            throw error;
        }
        return data as User;
    },

    /**
     * Create a new student record
     */
    createProfile: async (studentData: User) => {
        const { data, error } = await supabase
            .from('students')
            .insert([studentData])
            .select()
            .single();

        if (error) {
            console.error('Error creating student profile:', error);
            throw error;
        }
        return data as User;
    },

    /**
     * Get all students (useful for admin or search features)
     */
    getAllStudents: async () => {
        const { data, error } = await supabase
            .from('students')
            .select('*');

        if (error) {
            console.error('Error fetching all students:', error);
            throw error;
        }
        return data as User[];
    }
};
