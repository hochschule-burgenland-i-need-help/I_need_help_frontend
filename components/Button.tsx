import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
    label: string;
    theme?: 'primary' | 'secondary';
    onPress?: () => void;
    disabled?: boolean;
};

export default function Button({ label, theme = 'primary', onPress, disabled = false }: Props) {
    const selectedTheme = themeStyles[theme] || themeStyles.primary;

    return (
        <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, selectedTheme.button, disabled && disabledStyles.button]} onPress={!disabled ? onPress : undefined}>
                <Text style={[styles.buttonLabel, selectedTheme.label, disabled && disabledStyles.label]}>{label}</Text>
            </Pressable>
        </View>
    );
}

const themeStyles = {
    primary: {
        button: {
            backgroundColor: '#00bfff',
        },
        label: {
            color: '#fff',
        },
    },
    secondary: {
        button: {
            backgroundColor: '#eee',
            borderWidth: 1,
            borderColor: '#aaa',
        },
        label: {
            color: '#444',
        },
    },
};

const disabledStyles = {
    button: {
        backgroundColor: '#ccc',
    },
    label: {
        color: '#888',
    },
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: '90%',
        height: 60,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    button: {
        borderRadius: 6,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
