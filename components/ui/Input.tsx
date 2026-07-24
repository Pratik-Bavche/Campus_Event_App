import React, { useState } from 'react';
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
    const [isFocused, setIsFocused] = useState(false);

    // Dark mode border: subtle at rest, slightly brighter on focus.
    // Light mode: keep transparent (the gray fill is the visual separator).
    const darkBorderColor = isFocused ? '#64748b' : '#475569';
    const borderColor = error
        ? colors.error
        : theme === 'dark'
            ? darkBorderColor
            : 'transparent';

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: theme === 'light' ? colors.border : colors.card,
                    borderColor,
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
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
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
