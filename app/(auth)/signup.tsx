import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { GraduationCap, Hash, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/theme';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const setUser = useAuthStore(state => state.setUser);
    const setToken = useAuthStore(state => state.setToken);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const handleSignup = async () => {
        if (!email || !rollNumber || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!email.endsWith('.edu')) {
            setError('Please use your college email address');
            // return; // Commented for testing flexibility
        }

        setIsLoading(true);
        setError('');

        try {
            const { token, user } = await authService.register(email, rollNumber, password);

            await SecureStore.setItemAsync('auth_token', token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(user));

            setToken(token);
            setUser(user);

            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                        <GraduationCap color="#ffffff" size={40} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Join your college event community
                    </Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="College Email"
                        placeholder="student@college.edu"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={<Mail size={20} color={colors.textMuted} />}
                    />

                    <Input
                        label="Roll Number"
                        placeholder="e.g. CS2023001"
                        value={rollNumber}
                        onChangeText={setRollNumber}
                        autoCapitalize="characters"
                        icon={<Hash size={20} color={colors.textMuted} />}
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Lock size={20} color={colors.textMuted} />}
                    />

                    {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                    <Button
                        title="Create Account"
                        onPress={handleSignup}
                        loading={isLoading}
                        style={styles.signupButton}
                    />

                    <View style={styles.footer}>
                        <Text style={{ color: colors.textMuted }}>Already have an account? </Text>
                        <Link href="/login" asChild>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Login</Text>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    signupButton: {
        marginTop: 10,
        height: 56,
    },
    errorText: {
        marginBottom: 16,
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
});
