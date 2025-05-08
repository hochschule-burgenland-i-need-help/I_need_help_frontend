import React from 'react';
import { View, Image, StyleSheet, Button, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');

const HomeScreen = () => {
    const router = useRouter();

    const routeRettung = async () => {
        router.replace('/(tabs)/HomeScreen'); //TODO replace with sub page Rettung ~ Jan
    };
    const routeFeuerwehr = async () => {
        router.replace('/(tabs)/HomeScreen'); //TODO replace with sub page Feuerwehr ~ Jan
    };
    const routePolizei = async () => {
        router.replace('/(tabs)/HomeScreen'); //TODO replace with sub page Polizei ~ Jan
    };

    const routeEmergency = async () => {
        router.replace('/(modals)/EmergencyScreen');
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={styles.logo} />
            </View>
            <View style={styles.container}>
                <Text style={styles.text}>Hallo, Max Mustermann!</Text>
                <View style={styles.button}>
                    <Button title="Rettung 🚑" onPress={routeRettung} color="red" />
                    <Button title="Polizei 🚓" onPress={routePolizei} color="blue" />
                    <Button title="Feuerwehr 🚒" onPress={routeFeuerwehr} color="green" />
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <Pressable
                    style={styles.sosButton}
                    onPress={() => {
                        routeEmergency();
                    }}>
                    <Text style={styles.sosText}>SOS</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 24,
    },
    logoContainer: {
        width: '100%',
        height: 130,
        backgroundColor: '#e71d1d',
        alignItems: 'center',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    logo: {
        width: 100,
        height: 100,
        marginTop: 10,
        resizeMode: 'contain',
    },
    text: {
        fontSize: 16,
        marginBottom: 32,
    },
    button: {
        flexDirection: 'column',
        fontSize: 32,
        gap: 10,
    },
    sosButton: {
        width: '90%',
        height: 65,
        justifyContent: 'center',
        backgroundColor: 'black',
        borderRadius: 10,
        marginBottom: 20,
    },
    sosText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 38,
        fontWeight: 'bold',
    },
});
