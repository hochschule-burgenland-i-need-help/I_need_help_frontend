import React, { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { View, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { booleanPointInPolygon, point } from '@turf/turf';
import countries from '../../constants/custom.geo.json';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import { FontAwesome } from '@expo/vector-icons';
import { useUserName } from '@/hooks/useUserName';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');

const HomeScreen = () => {
    const router = useRouter();
    const [, setErrorMsg] = useState<string | null>(null);
    const [, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [specificEmergencyNumbers, setSpecificEmergencyNumbers] = useState<EmergencyNumbers>(null);

    type EmergencyNumbers = {
        police?: string;
        ambulance?: string;
        fire?: string;
    } | null;

    const name = useUserName();

    const getCountryFromCoords = (latitude: number, longitude: number) => {
        const pt = point([longitude, latitude]);
        for (const feature of countries.features) {
            const geoFeature = feature as Feature<Polygon | MultiPolygon>;
            if (booleanPointInPolygon(pt, geoFeature)) {
                return geoFeature.properties?.iso_a2_eh;
            }
        }
    };
    const emergencyNumbers = require('../../constants/emergencyNumbers.json');
    const getEmergencyNumbers = (countryCode: string) => {
        if (emergencyNumbers[countryCode]) {
            return emergencyNumbers[countryCode];
        } else {
            console.log(`Standort: Keine Notrufnummern für das Land mit Code ${countryCode} gefunden.`);
            return emergencyNumbers['DEFAULT'];
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
                const country = getCountryFromCoords(currentLocation.coords.latitude, currentLocation.coords.longitude);

                const emergencyData = getEmergencyNumbers(country);
                setSpecificEmergencyNumbers(emergencyData);
            } catch (error) {
                const errorMessage = (error as Error).message;
                setErrorMsg(`Fehler beim Abrufen des Standorts: ${errorMessage}`);
            }
        })();
    }, []);

    const routeRettung = async () => router.replace('/(tabs)/BlueLightButtonAmbulance');
    const routeFeuerwehr = async () => router.replace('/(tabs)/BlueLightButtonFireDepartment');
    const routePolizei = async () => router.replace('/(tabs)/BlueLightButtonPolice');
    const routeEmergency = async () => router.replace('/(tabs)/EmergencyScreen');

    return (
        <View style={styles.screenContainer}>
            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={styles.logo} />
            </View>
            <View style={styles.container}>
                <View style={styles.profileContainer}>
                    <Text style={styles.greeting}>Hallo, {name || 'Gast'}!</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/PersonalDataScreen')}>
                        <FontAwesome name="user" size={26} color="#000" testID="UserIcon" />
                    </TouchableOpacity>
                </View>
                <View style={styles.button}>
                    <Button theme="fourth" label={`Rettung ${specificEmergencyNumbers?.ambulance || ''} 🚑 `} onPress={routeRettung} />
                    <Button theme="primary" label={`Polizei ${specificEmergencyNumbers?.police || ''} 🚓 `} onPress={routePolizei} />
                    <Button theme="third" label={`Feuerwehr ${specificEmergencyNumbers?.fire || ''} 🚒 `} onPress={routeFeuerwehr} />
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
