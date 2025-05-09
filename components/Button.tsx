import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
    label: string;
    theme?: 'primary' | 'secondary' | 'third' | 'fourth' | 'sos';
    onPress?: () => void;
    disabled?: boolean;
};

export default function Button({ label, theme = 'primary', onPress, disabled = false }: Props) {
    const selectedTheme = themeStyles[theme] || themeStyles.primary;

    return (
        <View style={[styles.buttonContainer, selectedTheme.container, disabled && disabledStyles.container]}>
            <Pressable style={[styles.button, selectedTheme.button, disabled && disabledStyles.button]} onPress={!disabled ? onPress : undefined}>
                <Text style={[styles.buttonLabel, selectedTheme.label, disabled && disabledStyles.label]}>{label}</Text>
            </Pressable>
        </View>
    );
}

const themeStyles = {
    primary: {
        container: {
            width: '90%' as const,
            height: 60,
        },
        button: {
            backgroundColor: '#00bfff',
        },
        label: {
            fontSize: 18,
            color: '#fff',
        },
    },
    secondary: {
        container: {
            width: '90%' as const,
            height: 60,
        },
        button: {
            backgroundColor: '#eee',
            borderWidth: 1,
            borderColor: '#aaa',
        },
        label: {
            fontSize: 18,
            color: '#444',
        },
    },
    third: {
        container: {
            width: '90%' as const,
            height: 60,
        },
        button: {
            backgroundColor: 'red',
            borderWidth: 1,
            borderColor: 'red',
        },
        label: {
            fontSize: 18,
            color: '#fff',
        },
    },
    fourth: {
        container: {
            width: '90%' as const,
            height: 60,
        },
        button: {
            backgroundColor: '#3ff724',
            borderWidth: 1,
            borderColor: '#3ff724',
        },
        label: {
            fontSize: 18,
            color: '#444',
        },
    },
    sos: {
        container: {
            width: '80%' as const,
            height: 65,
        },
        button: {
            backgroundColor: 'black',
            borderWidth: 1,
            borderColor: 'black',
        },
        label: {
            fontSize: 38,
            color: '#fff',
        },
    },
};

const disabledStyles = {
    container: {
        width: '90%' as const,
        height: 60,
    },
    button: {
        backgroundColor: '#ccc',
    },
    label: {
        fontSize: 18,
        color: '#888',
    },
};

const styles = StyleSheet.create({
    buttonContainer: {
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
        fontWeight: 'bold',
    },
});
