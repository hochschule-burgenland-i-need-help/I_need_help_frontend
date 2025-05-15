import React, { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { booleanPointInPolygon, point } from '@turf/turf';
import countries from '../../constants/custom.geo.json';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import { FontAwesome } from '@expo/vector-icons';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');

const HomeScreen = () => {
    const router = useRouter();
    const [, setErrorMsg] = useState<string | null>(null);
    const [, setLocation] = useState<Location.LocationObjectCoords | null>(null);

    const getCountryFromCoords = (latitude: number, longitude: number) => {
        const pt = point([longitude, latitude]);
        for (const feature of countries.features) {
            const geoFeature = feature as Feature<Polygon | MultiPolygon>;
            if (booleanPointInPolygon(pt, geoFeature)) {
                return geoFeature.properties;
            }
        }
    };

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Standortberechtigung abgelehnt.');
                setErrorMsg('Bitte aktivieren Sie den Standortzugriff in den Geräteeinstellungen.');
                return;
            }

            try {
                const currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(currentLocation.coords);
                console.log(`Standort: ${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`);
                console.log(getCountryFromCoords(currentLocation.coords.latitude, currentLocation.coords.longitude));
            } catch (error) {
                const errorMessage = (error as Error).message;
                setErrorMsg(`Fehler beim Abrufen des Standorts: ${errorMessage}`);
            }
        })();
    }, []);

    const routeRettung = async () => router.replace('/(tabs)/HomeScreen');
    const routeFeuerwehr = async () => router.replace('/(tabs)/HomeScreen');
    const routePolizei = async () => router.replace('/(tabs)/HomeScreen');
    const routeEmergency = async () => router.replace('/(modals)/EmergencyScreen');

    return (
        <View style={styles.screenContainer}>
            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={styles.logo} />
            </View>
            <View style={styles.container}>
                <View style={styles.profileContainer}>
                    <Text style={styles.greeting}>Hallo, Max Mustermann!</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/PersonalDataScreen')}>
                        <FontAwesome name="user" size={26} color="#000" testID="UserIcon" />
                    </TouchableOpacity>
                </View>
                <View style={styles.button}>
                    <Button theme="third" label="Rettung 🚑" onPress={routeRettung} />
                    <Button theme="primary" label="Polizei 🚓" onPress={routePolizei} />
                    <Button theme="fourth" label="Feuerwehr 🚒" onPress={routeFeuerwehr} />
                </View>
            </View>
            <View style={[styles.button, { marginBottom: 20 }]}>
                <Button theme="sos" label="SOS" onPress={routeEmergency} />
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
    logo: {
        width: 100,
        height: 100,
        marginTop: 10,
        resizeMode: 'contain',
    },
    greeting: {
        fontSize: 20,
        fontWeight: '500',
    },
    button: {
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
});
