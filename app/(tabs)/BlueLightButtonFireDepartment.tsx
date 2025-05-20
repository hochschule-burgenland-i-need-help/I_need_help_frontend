import React, { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { View, Image, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { booleanPointInPolygon, point } from '@turf/turf';
import countries from '../../constants/custom.geo.json';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import AntDesign from '@expo/vector-icons/AntDesign';
import emergencyNumbers from '../../constants/emergencyNumbers.json';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');

const HomeScreen = () => {
    const router = useRouter();
    const [, setErrorMsg] = useState<string | null>(null);
    const [, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [countryCode, setCountryCode] = useState<string>('DEFAULT');

    type EmergencyInfo = { ambulance?: string; fire?: string; police?: string; note?: string };
    const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo>(emergencyNumbers['DEFAULT']);

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
                setErrorMsg('Bitte Standortzugriff erlauben.');
                return;
            }
            try {
                const { coords } = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(coords);

                const locationInfo = getCountryFromCoords(coords.latitude, coords.longitude);

                const rawCode = locationInfo?.iso_a2?.toUpperCase();
                const code = rawCode && emergencyNumbers[rawCode] ? rawCode : 'DEFAULT';
                setCountryCode(code);
                setEmergencyInfo(emergencyNumbers[code]);
            } catch {
                setErrorMsg('Fehler beim Abrufen des Standorts');
                setCountryCode('DEFAULT');
                setEmergencyInfo(emergencyNumbers['DEFAULT']);
            }
        })();
    }, []);

    const handleCall = () => {
        if (emergencyInfo?.fire) {
            Linking.openURL(`tel:${emergencyInfo.fire}`);
        }
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={styles.logo} />
            </View>

            {/* Roter Sub-Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/HomeScreen')}>
                    <AntDesign name="arrowleft" size={30} color="black" testID="ArrowLeft" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Feuerwehr</Text>
                <Text style={{ fontSize: 24 }}>🚒</Text>
            </View>

            <View style={styles.container}>
                <View style={styles.row}>
                    <Text style={styles.label}>Nummer: {emergencyInfo?.fire ?? '...'}</Text>
                    <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                        <Text style={styles.callButtonText}>Anrufen</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>Nächste Station</Text>
                <Text>
                    <Text style={styles.label}>Stadt:</Text> Wien, 1010
                </Text>
                <Text>
                    <Text style={styles.label}>Straße:</Text> Ringstrasse 2
                </Text>

                {countryCode === 'DEFAULT' && emergencyNumbers['DEFAULT'].note && <Text style={styles.note}>{emergencyNumbers['DEFAULT'].note}</Text>}
            </View>

            <View style={styles.button}>
                <Button theme="third" label="Navigieren" />
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
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#cc0000', // Rot für Feuerwehr
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    button: {
        marginTop: 20,
        width: '100%',
        gap: 12,
        alignItems: 'center',
    },
    callButton: {
        backgroundColor: '#e71d1d',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    callButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    note: {
        marginTop: 20,
        fontStyle: 'italic',
        color: '#666',
    },
});
