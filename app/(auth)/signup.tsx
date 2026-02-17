import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { BookOpen, Calendar, GraduationCap, Hash, Lock, Mail, Phone, User } from 'lucide-react-native';
// ...
const handleSignup = async () => {
    if (!name || !email || !rollNumber || !password || !branch || !year || !phoneNumber) {
        setError('All fields are mandatory');
        return;
    }

    /* 
    if (!email.endsWith('.edu')) {
        setError('Please use your college email address');
        // return; // Commented for testing flexibility
    }
    */

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
            phoneNumber
        );
        // ...
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Input
                label="Full Name"
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
                        value={rollNumber}
                        onChangeText={setRollNumber}
                        autoCapitalize="characters"
                        icon={<Hash size={20} color={colors.textMuted} />}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
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

            <Select
                label="Year"
                value={year}
                onSelect={setYear}
                options={yearOptions}
                icon={<Calendar size={20} color={colors.textMuted} />}
            />

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
