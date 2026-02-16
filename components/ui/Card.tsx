import React from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
    useColorScheme
} from 'react-native';
import { Colors } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const content = (
        <View style={[
            styles.card,
            {
                backgroundColor: colors.card,
                borderColor: colors.border
            },
            style
        ]}>
            {children}
        </View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.9 : 1,
                })}
            >
                {content}
            </Pressable>
        );
    }

    return content;
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        overflow: 'hidden',
        // Shadow for light mode
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
});
