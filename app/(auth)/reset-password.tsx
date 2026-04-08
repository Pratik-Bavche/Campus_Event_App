import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Lock, Save, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
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

export default function ResetPasswordScreen() {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const handleResetPassword = async () => {
        if (!password || !confirmPassword) {
            setError('Please fill in both fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authService.resetPassword(password);

            Alert.alert(
                'Success',
                'Your password has been reset successfully. You can now login with your new password.',
                [{ text: 'Login', onPress: () => router.replace('/login') }]
            );
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LinearGradient
                colors={colors.headerGradient as any}
                style={[styles.headerGradient, { height: isTablet ? height * 0.4 : height * 0.35 }]}
            >
                <View style={[styles.headerContent, { paddingHorizontal: isTablet ? 60 : 30 }]}>
                    <View style={styles.logoContainer}>
                        <ShieldCheck color="#fff" size={isTablet ? 60 : 48} />
                    </View>
                    <Text style={[styles.headerTitle, { fontSize: isTablet ? 36 : 28 }]}>New Password</Text>
                    <Text style={[styles.headerSubtitle, { fontSize: isTablet ? 16 : 14 }]}>Secure your account with a new password</Text>
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
                            <Text style={[styles.formTitle, { color: colors.text, fontSize: isTablet ? 24 : 20 }]}>Reset Password</Text>
                            <View style={[styles.titleSeparator, { backgroundColor: colors.primary }]} />
                        </View>

                        <Input
                            label="New Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={colors.textMuted} />}
                        />

                        <Input
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            icon={<Lock size={20} color={colors.textMuted} />}
                        />

                        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                        <Button
                            title="Update Password"
                            onPress={handleResetPassword}
                            loading={isLoading}
                            style={{ ...styles.resetButton, height: isTablet ? 64 : 58 }}
                            icon={<Save size={20} color="#fff" />}
                        />

                        <TouchableOpacity
                            onPress={() => router.replace('/login')}
                            style={styles.backToLogin}
                        >
                            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
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
        width: '100%',
    },
    logoContainer: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
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
    resetButton: {
        borderRadius: 18,
        elevation: 4,
        marginTop: 10,
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
    backToLogin: {
        marginTop: 24,
        alignItems: 'center',
    },
});
