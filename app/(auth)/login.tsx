import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { ChevronRight, GraduationCap, Hash, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/theme';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
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

    const handleLogin = async () => {
        if (!password || !rollNumber) {
            setError('Please fill in all mandatory fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { token, user } = await authService.login('', rollNumber, password);

            await AsyncStorage.setItem('auth_token', token);
            await AsyncStorage.setItem('user_data', JSON.stringify(user));

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
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LinearGradient
                colors={colors.headerGradient as any}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <GraduationCap color={colors.primary} size={42} />
                    </View>
                    <Text style={styles.headerTitle}>Welcome Back</Text>
                    <Text style={styles.headerSubtitle}>Login to access your campus dashboard</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <View style={styles.formHeader}>
                            <Text style={[styles.formTitle, { color: colors.text }]}>Student Login</Text>
                            <View style={[styles.titleSeparator, { backgroundColor: colors.primary }]} />
                        </View>

                        {/* 
                        <Input
                            label="College Email"
                            placeholder="student@college.edu"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Mail size={20} color={colors.textMuted} />}
                        /> 
                        */}

                        <Input
                            label="Roll Number"
                            value={rollNumber}
                            onChangeText={setRollNumber}
                            autoCapitalize="characters"
                            icon={<Hash size={20} color={colors.textMuted} />}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={colors.textMuted} />}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginButton}
                            icon={<ChevronRight size={20} color="#fff" />}
                        />

                        <View style={styles.footer}>
                            <Text style={{ color: colors.textMuted }}>Don't have an account? </Text>
                            <Link href="/signup" asChild>
                                <TouchableOpacity>
                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Create One</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -60,
        zIndex: 10,
    },
    headerGradient: {
        height: height * 0.4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        width: 75,
        height: 75,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
        justifyContent: 'flex-start',
    },
    card: {
        borderRadius: 35,
        padding: 28,
        paddingTop: 40,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        zIndex: 10,
    },
    formHeader: {
        marginBottom: 24,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    titleSeparator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: -4,
    },
    loginButton: {
        height: 58,
        borderRadius: 18,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    errorText: {
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
});
