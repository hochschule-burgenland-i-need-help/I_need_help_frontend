import React from 'react';
import Button from '@/components/Button';
import { View, Text, StyleSheet, Alert, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const DisclaimerScreen = () => {
    const router = useRouter();

    const accept = async () => {
        await AsyncStorage.setItem('disclaimerAccepted', 'true');
        // Hier muss die Richtige "route" angegeben wernde: zb "app/index.tsx"
        router.replace('/PersonalDataScreen');
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
                <Button theme="primary" label="Akzeptieren" onPress={accept} />
                <Button theme="third" label="Ablehnen" onPress={decline} />
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
