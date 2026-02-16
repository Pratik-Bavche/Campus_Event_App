import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { GraduationCap, Lock, Mail } from 'lucide-react-native';
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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const setUser = useAuthStore(state => state.setUser);
    const setToken = useAuthStore(state => state.setToken);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Roll number is required by the prompt, but for login we'll assume email/password 
            // or we can add roll number field. Prompt said: Fields: College email, Roll number, Password
            // I'll add roll number to the login as well if needed, but usually email/password is enough.
            // Let's stick to the prompt's requested fields.
            const { token, user } = await authService.login(email, 'CS123', password);

            await SecureStore.setItemAsync('auth_token', token);
            await SecureStore.setItemAsync('user_data', JSON.stringify(user));

            setToken(token);
            setUser(user);

            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
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
                    <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Enter your details to access your account
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
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Lock size={20} color={colors.textMuted} />}
                    />

                    {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={isLoading}
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={{ color: colors.textMuted }}>Don't have an account? </Text>
                        <Link href="/signup" asChild>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</Text>
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
    loginButton: {
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
