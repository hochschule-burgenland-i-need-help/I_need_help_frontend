import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {useRouter} from 'expo-router';

const home = () => {
    const router = useRouter();

    const routeRettung = async () => {
        router.replace('/(tabs)/explore'); //TODO replace with sub page Rettung ~ Jan
    };
    const routeFeuerwehr = async () => {
        router.replace('/(tabs)/explore'); //TODO replace with sub page Feuerwehr ~ Jan
    };
    const routePolizei = async () => {
        router.replace('/(tabs)/explore'); //TODO replace with sub page Polizei ~ Jan
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Hallo, Max Mustermann!
            </Text>
            <View style={styles.button}>
                <Button title="Rettung 🚑" onPress={routeRettung} color="red"/>
                <Button title="Polizei 🚓" onPress={routePolizei} color="blue"/>
                <Button title="Feuerwehr 🚒" onPress={routeFeuerwehr} color="green"/>
            </View>
        </View>
    );
};

export default home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 16,
        marginBottom: 32,
    },
    button: {
        flexDirection: 'column',
        fontSize: 32,
        gap: 10,
    }
});
