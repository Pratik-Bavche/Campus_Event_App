import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
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
            const updatedUser = { ...currentUser, ...data };
            await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
            set({ user: updatedUser });
        }
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
        set({ user: null, token: null, isAuthenticated: false });
    },
    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            const userData = await SecureStore.getItemAsync('user_data');
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
