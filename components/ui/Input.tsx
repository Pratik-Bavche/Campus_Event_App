import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
    useColorScheme
} from 'react-native';
import { Colors } from '../../constants/theme';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    error?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    containerStyle?: ViewStyle;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    error,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    containerStyle,
    icon
}) => {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: theme === 'light' ? '#f3f4f6' : '#1e293b',
                    borderColor: error ? colors.error : 'transparent'
                }
            ]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    style={[styles.input, { color: colors.text }]}
                />
            </View>
            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
    },
    iconContainer: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
