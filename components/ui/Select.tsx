import { ChevronDown, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { Colors } from '../../constants/theme';

const { height } = Dimensions.get('window');

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    value: string;
    onSelect: (value: string) => void;
    options: Option[];
    icon?: React.ReactNode;
    error?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    placeholder,
    value,
    onSelect,
    options,
    icon,
    error
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const theme = useColorScheme() ?? 'light';
    const colors = Colors[theme];

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (val: string) => {
        onSelect(val);
        setIsVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsVisible(true)}
                style={[
                    styles.selectContainer,
                    {
                        backgroundColor: theme === 'light' ? '#f3f4f6' : '#1e293b',
                        borderColor: error ? colors.error : 'transparent'
                    }
                ]}
            >
                <View style={styles.leftContent}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[
                        styles.valueText,
                        { color: value ? colors.text : colors.textMuted }
                    ]}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                </View>
                <ChevronDown size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setIsVisible(false)}
                >
                    <View style={[
                        styles.modalContent,
                        { backgroundColor: colors.card, shadowColor: colors.text }
                    ]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select {label}</Text>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <X size={24} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        { borderBottomColor: colors.border },
                                        value === item.value && { backgroundColor: colors.primary + '15' }
                                    ]}
                                    onPress={() => handleSelect(item.value)}
                                >
                                    <Text style={[
                                        styles.optionLabel,
                                        { color: colors.text },
                                        value === item.value && { color: colors.primary, fontWeight: '700' }
                                    ]}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: height * 0.4 }}
                        />
                    </View>
                </Pressable>
            </Modal>
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
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 50,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: 8,
    },
    valueText: {
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        ...Platform.select({
            web: {
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
            },
            default: {
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
            }
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionItem: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
    },
    optionLabel: {
        fontSize: 16,
    }
});
