import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { BookOpen, Calendar, GraduationCap, Hash, Lock, Mail, Phone, User } from 'lucide-react-native';
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
import { Select } from '../../components/ui/Select';
import { Colors } from '../../constants/theme';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';

export default function SignupScreen() {
    const { width, height } = useWindowDimensions();
    const isTablet = width >= 768;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [division, setDivision] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const setUser = useAuthStore(state => state.setUser);
    const setToken = useAuthStore(state => state.setToken);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const branchOptions = [
        { label: 'Information Technology', value: 'Information Technology' },
        { label: 'Computer Engineering', value: 'Computer Science' },
        { label: 'Electronics and Telecommunication Engineering', value: 'Electronics' },
        { label: 'Mechanical Engineering', value: 'Mechanical' },
        { label: 'Civil Engineering', value: 'Civil' },
        { label: 'Instrumentation and Control Engineering', value: 'Instrumentation and Control' },
        { label: 'Robotics and Automation', value: 'Robotics and Automation' },
        { label: 'Chemical Engineering', value: 'Chemical' },
        { label: 'Artificial Intelligence and Data Science', value: 'Artificial Intelligence and Data Science' },
    ];

    const yearOptions = [
        { label: 'First Year (FE)', value: 'FE' },
        { label: 'Second Year (SE)', value: 'SE' },
        { label: 'Third Year (TE)', value: 'TE' },
        { label: 'Fourth Year (BE)', value: 'BE' },
    ];

    const divisionOptions = [
        { label: 'Division A', value: 'A' },
        { label: 'Division B', value: 'B' },
        { label: 'Division C', value: 'C' },
    ];

    const handleSignup = async () => {
        if (!name || !email || !rollNumber || !password || !branch || !year || !phoneNumber || !division) {
            setError('All fields are mandatory');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authService.register(
                email,
                rollNumber,
                password,
                name,
                branch,
                year,
                phoneNumber,
                division
            );

            Alert.alert(
                'Success',
                'Account created successfully. Please login to continue.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login')
                    }
                ]
            );
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
                style={[styles.headerGradient, { height: isTablet ? 320 : 260 }]}
            >
                <View style={[styles.headerContent, { paddingTop: isTablet ? 40 : 0 }]}>
                    <View style={[styles.logoContainer, isTablet && { width: 90, height: 90, borderRadius: 28 }]}>
                        <GraduationCap color={colors.primary} size={isTablet ? 54 : 40} />
                    </View>
                    <Text style={[styles.headerTitle, { fontSize: isTablet ? 38 : 26 }]}>Create Account</Text>
                    <Text style={[styles.headerSubtitle, { fontSize: isTablet ? 17 : 14 }]}>Join the campus community</Text>
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
                >
                    <View style={[
                        styles.card,
                        { backgroundColor: colors.card, shadowColor: colors.text },
                        isTablet && { width: 600, padding: 40 }
                    ]}>
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            icon={<User size={20} color={colors.textMuted} />}
                        />

                        <Input
                            label="College Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon={<Mail size={20} color={colors.textMuted} />}
                        />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: isTablet ? 12 : 8 }}>
                                <Input
                                    label="Roll Number"
                                    value={rollNumber}
                                    onChangeText={setRollNumber}
                                    autoCapitalize="characters"
                                    icon={<Hash size={20} color={colors.textMuted} />}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: isTablet ? 12 : 8 }}>
                                <Input
                                    label="Mobile No"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    icon={<Phone size={20} color={colors.textMuted} />}
                                />
                            </View>
                        </View>

                        <Select
                            label="Branch"
                            value={branch}
                            onSelect={setBranch}
                            options={branchOptions}
                            icon={<BookOpen size={20} color={colors.textMuted} />}
                        />

                        <View style={isTablet ? styles.row : {}}>
                            <View style={isTablet ? { flex: 1, marginRight: 12 } : {}}>
                                <Select
                                    label="Year"
                                    value={year}
                                    onSelect={setYear}
                                    options={yearOptions}
                                    icon={<Calendar size={20} color={colors.textMuted} />}
                                />
                            </View>
                            <View style={isTablet ? { flex: 1, marginLeft: 12 } : {}}>
                                <Select
                                    label="Division"
                                    value={division}
                                    onSelect={setDivision}
                                    options={divisionOptions}
                                    icon={<Hash size={20} color={colors.textMuted} />}
                                />
                            </View>
                        </View>

                        <Input
                            label="Password"
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
                            style={{ ...styles.signupButton, height: isTablet ? 64 : 56 }}
                        />

                        <View style={styles.footer}>
                            <Text style={{ color: colors.textMuted, fontSize: isTablet ? 15 : 14 }}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity>
                                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: isTablet ? 15 : 14 }}>Login</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView >
            </KeyboardAvoidingView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: -20,
    },
    headerGradient: {
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
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
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
