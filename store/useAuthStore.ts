import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { profileService } from '../services/api';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    updateUser: (data: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => set({ token }),
    updateUser: async (data) => {
        const currentUser = get().user;
        if (currentUser) {
            // Update in Supabase
            const updatedUser = await profileService.updateProfile(data);

            // Update in Local Storage
            await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));

            // Update in Global State
            set({ user: updatedUser });
        }
    },
    logout: async () => {
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_data');
        set({ user: null, token: null, isAuthenticated: false });
    },
    initialize: async () => {
        try {
            const token = await AsyncStorage.getItem('auth_token');
            const userData = await AsyncStorage.getItem('user_data');
            if (token && userData) {
                set({
                    token,
                    user: JSON.parse(userData),
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to initialize auth store', error);
            set({ isLoading: false });
        }
    },
}));
