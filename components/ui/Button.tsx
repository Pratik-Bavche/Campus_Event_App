import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    useColorScheme,
    ViewStyle
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon
}) => {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const getVariantStyle = () => {
        switch (variant) {
            case 'secondary':
                return { backgroundColor: colors.secondary };
            case 'outline':
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
            case 'danger':
                return { backgroundColor: colors.error };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return { color: colors.primary };
            default:
                return { color: '#ffffff' };
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'sm':
                return { paddingVertical: 8, paddingHorizontal: 16 };
            case 'lg':
                return { paddingVertical: 16, paddingHorizontal: 32 };
            default:
                return { paddingVertical: 12, paddingHorizontal: 24 };
        }
    };

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                getVariantStyle(),
                getSizeStyle(),
                (disabled || loading) && styles.disabled,
                { transform: [{ scale: (pressed && !disabled && !loading) ? 0.96 : 1 }] },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : '#ffffff'} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    disabled: {
        opacity: 0.6,
    },
});
