import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { ChevronRight, GraduationCap, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/theme';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
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
            setError('Please fill in all mandatory fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { token, user } = await authService.login(email, '', password);
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
                style={[styles.headerGradient, { height: isTablet ? height * 0.45 : height * 0.4 }]}
            >
                <View style={[styles.headerContent, { paddingHorizontal: isTablet ? 60 : 30 }]}>
                    <View style={[styles.logoContainer, isTablet && { width: 100, height: 100, borderRadius: 28 }]}>
                        <GraduationCap color={colors.primary} size={isTablet ? 60 : 42} />
                    </View>
                    <Text style={[styles.headerTitle, { fontSize: isTablet ? 42 : 30 }]}>Welcome Back</Text>
                    <Text style={[styles.headerSubtitle, { fontSize: isTablet ? 18 : 14 }]}>Login to access your campus dashboard</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        isTablet && { alignItems: 'center' }
                    ]}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={[
                        styles.card,
                        { backgroundColor: colors.card },
                        isTablet && { width: 500, padding: 48 }
                    ]}>
                        <View style={styles.formHeader}>
                            <Text style={[styles.formTitle, { color: colors.text, fontSize: isTablet ? 28 : 22 }]}>Student Login</Text>
                            <View style={[styles.titleSeparator, { backgroundColor: colors.primary }]} />
                        </View>

                        <Input
                            label="College Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Mail size={20} color={colors.textMuted} />}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={colors.textMuted} />}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={{ color: colors.primary, fontSize: isTablet ? 14 : 13, fontWeight: '600' }}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={{ ...styles.loginButton, height: isTablet ? 64 : 58 }}
                            icon={<ChevronRight size={20} color="#fff" />}
                        />

                        <View style={styles.footer}>
                            <Text style={{ color: colors.textMuted, fontSize: isTablet ? 15 : 14 }}>Don't have an account? </Text>
                            <Link href="/signup" asChild>
                                <TouchableOpacity>
                                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: isTablet ? 15 : 14 }}>Create One</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    headerContent: {
        alignItems: 'center',
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
        ...Platform.select({
            web: {
                boxShadow: '0 8px 12px rgba(0, 0, 0, 0.2)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            }
        }),
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        textAlign: 'center',
    },
    headerSubtitle: {
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
        ...Platform.select({
            web: {
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
            }
        }),
        zIndex: 10,
    },
    formHeader: {
        marginBottom: 24,
    },
    formTitle: {
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
        borderRadius: 18,
        elevation: 4,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            }
        }),
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
