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
import { LocationInfo } from '@/lib/location_info';
import { findDepartment } from '@/lib/find_department';
import { Department } from '@/lib/osm/overpass_api';
import MapView, { Marker } from 'react-native-maps';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');

const HomeScreen = () => {
    const router = useRouter();
    const [, setErrorMsg] = useState<string | null>(null);
    const [, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [countryCode, setCountryCode] = useState<string>('DEFAULT');
    const [departmentInfo, setDepartmentInfo] = useState<LocationInfo | null>(null);
    const [loadErrorDepartment, setLoadErrorDepartment] = useState<boolean>(false);
    const [loadingDepartment, setLoadingDepartment] = useState<boolean>(true);

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

    const writeName = () => {
        if (loadingDepartment === true) {
            return 'load ...';
        } else if (loadErrorDepartment === true || departmentInfo === null) {
            return 'error';
        } else {
            return departmentInfo.name;
        }
    };

    const writeCity = () => {
        if (loadingDepartment === true) {
            return 'load ...';
        } else if (loadErrorDepartment === true || departmentInfo === null) {
            return 'error';
        } else {
            return departmentInfo.city + ', ' + departmentInfo.postcode;
        }
    };

    const writeStreet = () => {
        if (loadingDepartment === true) {
            return 'load ...';
        } else if (loadErrorDepartment === true || departmentInfo === null) {
            return 'error';
        } else {
            return departmentInfo.street + ' ' + departmentInfo.house;
        }
    };

    const openGoogleMaps = () => {
        if (loadingDepartment === true) {
            return 'load ...';
        } else if (loadErrorDepartment === true || departmentInfo === null) {
            return 'error';
        } else {
            const destination = encodeURIComponent(
                departmentInfo.postcode + ' ' + departmentInfo.city + ',  ' + departmentInfo.street + ' ' + departmentInfo.house
            );
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
            Linking.openURL(url).catch((err) => console.error('Fehler beim Öffnen von Google Maps', err));
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

                const departmentResult = await findDepartment(coords.latitude, coords.longitude, Department.Ambulance);
                setLoadingDepartment(false);
                if (departmentResult === null || departmentResult.length === 0) {
                    setLoadErrorDepartment(true);
                    console.log('set error');
                }
                setDepartmentInfo(departmentResult?.[0] ?? null);

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
        if (emergencyInfo?.ambulance) {
            Linking.openURL(`tel:${emergencyInfo.ambulance}`);
        }
    };

    return (
        <View style={styles.screenContainer}>
            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={styles.logo} />
            </View>

            {/* Grüner Sub-Header */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/HomeScreen')}>
                    <AntDesign name="arrowleft" size={30} color="black" testID="ArrowLeft" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rettung</Text>
                <Text style={{ fontSize: 24 }}>🚑</Text>
            </View>

            <View style={styles.container}>
                {/* Nummer + Button in einer Zeile */}
                <View style={styles.row}>
                    <Text style={styles.label}>Nummer: {emergencyInfo?.ambulance ?? '...'}</Text>
                    <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                        <Text style={styles.callButtonText}>Anrufen</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.label, { marginTop: 16 }]}>Nächste Station</Text>

                <Text testID="testName">
                    <Text style={styles.label}>Name:</Text> {writeName()}
                </Text>
                <Text testID="testCity">
                    <Text style={styles.label}>Stadt:</Text> {writeCity()}
                </Text>
                <Text testID="testStreet">
                    <Text style={styles.label}>Straße:</Text> {writeStreet()}
                </Text>

                {/* Optional: Notiz anzeigen bei Fallback */}
                {countryCode === 'DEFAULT' && emergencyNumbers['DEFAULT'].note && <Text style={styles.note}>{emergencyNumbers['DEFAULT'].note}</Text>}
            </View>

            <View style={styles.mapContainer}>
                <MapView
                    zoomEnabled={true}
                    zoomControlEnabled={true}
                    scrollEnabled={true}
                    loadingEnabled={true}
                    style={styles.map}
                    region={
                        departmentInfo
                            ? {
                                  latitude: departmentInfo.lat,
                                  longitude: departmentInfo.lon,
                                  latitudeDelta: 0.02,
                                  longitudeDelta: 0.02,
                              }
                            : undefined
                    }>
                    <Marker
                        title={departmentInfo ? departmentInfo.name : ''}
                        coordinate={
                            departmentInfo
                                ? {
                                      latitude: departmentInfo.lat,
                                      longitude: departmentInfo.lon,
                                  }
                                : { latitude: 0, longitude: 0 }
                        }></Marker>
                </MapView>
            </View>

            <View style={styles.button}>
                <Button
                    theme="third"
                    label={loadingDepartment ? 'Lädt...' : 'Navigieren'}
                    disabled={loadingDepartment}
                    onPress={loadingDepartment ? undefined : openGoogleMaps}
                />
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
        flex: 1 / 2,
        padding: 24,
    },
    logoContainer: {
        width: '100%',
        height: 130,
        backgroundColor: '#e71d1d',
        alignItems: 'center',
    },
    mapContainer: {
        flex: 1 / 2,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
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
        backgroundColor: '#22bb33',
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
