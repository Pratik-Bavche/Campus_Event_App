import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Send } from 'lucide-react-native';
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

// IMPORTANT: Replace with your backend URL
// For development using physical device, use your machine's local IP (e.g., http://192.168.1.x:5000)
const BACKEND_URL = 'http://10.15.148.99:5000'; // Using the IP from your Expo logs

export default function ForgotPasswordScreen() {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const handleSendResetLink = async () => {
        if (!email) {
            setError('Please enter your registered email');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Calling the backend API I created earlier
            const response = await axios.post(`${BACKEND_URL}/api/forgot-password`, { email });

            setIsSuccess(true);
            Alert.alert(
                'Link Sent',
                'If an account exists with this email, you will receive a password reset link shortly.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err: any) {
            console.error('Forgot password error:', err);
            // Even on error, we might want to show the same message for security, 
            // but for now let's show the error if it's a connectivity issue
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontSize: isTablet ? 36 : 28 }]}>Reset Password</Text>
                    <Text style={[styles.headerSubtitle, { fontSize: isTablet ? 16 : 14 }]}>Enter your email to receive a reset link</Text>
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
                            <Text style={[styles.formTitle, { color: colors.text, fontSize: isTablet ? 24 : 20 }]}>Forgot Password?</Text>
                            <View style={[styles.titleSeparator, { backgroundColor: colors.primary }]} />
                        </View>

                        <Text style={[styles.instructionText, { color: colors.textMuted }]}>
                            Don't worry! It happens. Please enter the email address associated with your account.
                        </Text>

                        <Input
                            label="Registration Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Mail size={20} color={colors.textMuted} />}
                        />

                        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

                        <Button
                            title="Send Reset Link"
                            onPress={handleSendResetLink}
                            loading={isLoading}
                            style={{ ...styles.resetButton, height: isTablet ? 64 : 58 }}
                            icon={<Send size={20} color="#fff" />}
                            disabled={isSuccess}
                        />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backToLogin}
                        >
                            <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>Back to Login</Text>
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
    backButton: {
        position: 'absolute',
        top: -20,
        left: 20,
        padding: 10,
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
        marginBottom: 16,
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
    instructionText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
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
