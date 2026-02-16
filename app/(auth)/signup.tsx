import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { BookOpen, Calendar, GraduationCap, Hash, Lock, Mail, Phone, User } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const setUser = useAuthStore(state => state.setUser);
    const setToken = useAuthStore(state => state.setToken);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const handleSignup = async () => {
        if (!name || !email || !rollNumber || !password || !branch || !year || !phoneNumber) {
            setError('All fields are mandatory');
            return;
        }

        if (!email.endsWith('.edu')) {
            setError('Please use your college email address');
            // return; // Commented for testing flexibility
        }

        setIsLoading(true);
        setError('');

        try {
            const { token, user } = await authService.register(
                email,
                rollNumber,
                password,
                name,
                branch,
                year,
                phoneNumber
            );

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
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LinearGradient
                colors={colors.headerGradient as any}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <GraduationCap color={colors.primary} size={40} />
                    </View>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSubtitle}>Join the campus community</Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            icon={<User size={20} color={colors.textMuted} />}
                        />

                        <Input
                            label="College Email"
                            placeholder="student@college.edu"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Mail size={20} color={colors.textMuted} />}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Input
                                    label="Roll Number"
                                    placeholder="CS2023001"
                                    value={rollNumber}
                                    onChangeText={setRollNumber}
                                    autoCapitalize="characters"
                                    icon={<Hash size={20} color={colors.textMuted} />}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Input
                                    label="Mobile No"
                                    placeholder="9876543210"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    icon={<Phone size={20} color={colors.textMuted} />}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Input
                                    label="Branch"
                                    placeholder="Comp / IT / Entc"
                                    value={branch}
                                    onChangeText={setBranch}
                                    icon={<BookOpen size={20} color={colors.textMuted} />}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                                <Input
                                    label="Year"
                                    placeholder="FE / SE / TE / BE"
                                    value={year}
                                    onChangeText={setYear}
                                    icon={<Calendar size={20} color={colors.textMuted} />}
                                />
                            </View>
                        </View>

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
                            title="Sign Up"
                            onPress={handleSignup}
                            loading={isLoading}
                            style={styles.signupButton}
                        />

                        <View style={styles.footer}>
                            <Text style={{ color: colors.textMuted }}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Login</Text>
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
        marginTop: -20,
    },
    headerGradient: {
        height: 260,
        paddingTop: 60,
        alignItems: 'center',
    },
    headerContent: {
        alignItems: 'center',
    },
    logoContainer: {
        width: 70,
        height: 70,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 30,
        padding: 24,
        paddingTop: 30,
        elevation: 10,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signupButton: {
        marginTop: 10,
        height: 56,
        borderRadius: 16,
    },
    errorText: {
        marginBottom: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
});
