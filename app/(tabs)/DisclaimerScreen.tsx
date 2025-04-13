import React from 'react';
import { View, Text, StyleSheet, Button, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const DisclaimerScreen = () => {
    const router = useRouter();

    const accept = async () => {
        await AsyncStorage.setItem('disclaimerAccepted', 'true');
        // Hier muss die Richtige "route" angegeben wernde: zb "app/index.tsx"
        router.replace('/(tabs)/home');
    };

    const decline = () => {
        Alert.alert('Zustimmung erforderlich', 'Ohne Zustimmung kann die App nicht genutzt werden.', [
            { text: 'App schließen', onPress: () => BackHandler.exitApp() },
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Nutzungsbedingungen</Text>
            <Text style={styles.text}>[Hier steht der rechtlich geprüfte Disclaimer-Text. Aktuell nur ein Platzhalter.]</Text>
            <View style={styles.buttons}>
                <Button title="Akzeptieren" onPress={accept} />
                <Button title="Ablehnen" onPress={decline} color="red" />
            </View>
        </View>
    );
};

export default DisclaimerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        marginBottom: 32,
    },
    buttons: {
        flexDirection: 'column',
        gap: 10,
    },
});
