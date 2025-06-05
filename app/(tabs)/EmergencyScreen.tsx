import React from 'react';
import Button from '@/components/Button';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as FileSystem from 'expo-file-system';
import { decryptData } from '@/utils/encryption';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');

/**
 * EmergencyScreen is a React Native screen component designed to display
 * critical personal information (name, age, weight, height, blood group)
 * during emergency situations.
 *
 * This screen:
 * - Loads and decrypts user data from local encrypted file storage.
 * - Displays the data in a highly visible format.
 * - Alternates background color every 500ms (white <-> red) to attract attention.
 * - Keeps the screen awake using `useKeepAwake`.
 * - Provides a button to return to the home screen.
 *
 * Data is loaded once the screen gains focus using `useFocusEffect`,
 * and is decrypted via the `decryptData` utility.
 * If an error occurs during data retrieval, a toast notification is displayed.
 *
 * @component
 * @example
 * return <EmergencyScreen />;
 */
const EmergencyScreen = () => {
    const router = useRouter();
    const userDataFile = FileSystem.documentDirectory + 'user_data.json';

    const [name, setName] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');

    const [on, setOn] = useState(true);

    /**
     * Prevents the screen from sleeping while this component is mounted.
     * Critical for ensuring the emergency information stays visible.
     */
    useKeepAwake();

    /**
     * Navigates the user back to the HomeScreen using the router.
     * This is typically triggered by the "Close" button.
     *
     * @async
     * @function
     * @returns {Promise<void>} Resolves when navigation is complete.
     */
    const routeHome = async () => {
        router.replace('/(tabs)/HomeScreen');
    };

    /**
     * Loads encrypted user data from the local filesystem, decrypts it,
     * and populates the state variables (name, age, weight, height, blood group).
     *
     * If the file does not exist, the function exits silently.
     * If an error occurs, a toast notification is shown.
     *
     * @async
     * @function
     * @returns {Promise<void>} Resolves when the data has been loaded or an error is handled.
     */
    const loadData = async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(userDataFile);
            if (!fileInfo?.exists) {
                return;
            }

            const encryptedContent = await FileSystem.readAsStringAsync(userDataFile, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            const decrypted = await decryptData(encryptedContent);
            const data = JSON.parse(decrypted);

            setName(data.name || '');
            setDate(data.date ? new Date(data.date) : undefined);
            setWeight(data.weight?.toString() || '');
            setHeight(data.height?.toString() || '');
            setBloodGroup(data.bloodGroup || '');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Benutzerdaten',
                text2: 'Fehler beim Laden der Daten! ' + error,
                position: 'top',
                autoHide: true,
                visibilityTime: 4000,
            });
        }
    };

    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    /**
     * Loads user data when the screen gains focus.
     * Ensures that the most up-to-date information is displayed each time.
     *
     * Wrapped in `useFocusEffect` to trigger on screen focus.
     */
    useFocusEffect(
        useCallback(() => {
            (async () => {
                await loadData();
            })();
        }, [])
    );

    /**
     * Sets up a 500ms interval to toggle the background color
     * between white and red, creating a blinking effect for emergency visibility.
     *
     * Cleans up the interval on component unmount.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            setOn((prev) => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <View testID="outerContainer" style={[styles.screenContainer, { backgroundColor: on ? 'white' : '#e71d1d' }]}>
            <View style={styles.logoContainer}>
                <Image source={LogoImage} style={styles.logo} />
            </View>
            <View testID="bodyContainer" style={styles.bodyContainer}>
                <Text testID="title" accessible={true} accessibilityLabel="SOS" style={styles.title}>
                    SOS
                </Text>

                <View style={styles.rowLabel}>
                    <Text testID="labelName" accessible={true} accessibilityLabel="Name" style={styles.textLabel}>
                        Name
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text testID="name" accessible={true} accessibilityLabel={name} style={styles.textField}>
                        {name}
                    </Text>
                </View>

                <View style={styles.rowLabel}>
                    <Text testID="labelAge" accessible={true} accessibilityLabel="Alter" style={styles.textLabel}>
                        Alter
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text
                        testID="age"
                        accessible={true}
                        accessibilityLabel={date ? `&{calculateAge(date)}` : 'Alter nicht gesetzt'}
                        style={styles.textField}>
                        {date ? calculateAge(date) : ''}
                    </Text>
                </View>

                <View style={styles.rowLabel}>
                    <Text testID="labelWeight" accessible={true} accessibilityLabel="Gewicht" style={styles.textLabel}>
                        Gewicht
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text testID="weight" accessible={true} accessibilityLabel={weight + ' kg'} style={styles.textField}>
                        {weight} kg
                    </Text>
                </View>

                <View style={styles.rowLabel}>
                    <Text testID="labelHeight" accessible={true} accessibilityLabel="Größe" style={styles.textLabel}>
                        Größe
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text testID="height" accessible={true} accessibilityLabel={height + ' cm'} style={styles.textField}>
                        {height} cm
                    </Text>
                </View>

                <View style={styles.rowLabel}>
                    <Text testID="labelBloodGroup" accessible={true} accessibilityLabel="Blutgruppe" style={styles.textLabel}>
                        Blutgruppe
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text testID="bloodGroup" accessible={true} accessibilityLabel={bloodGroup} style={styles.textField}>
                        {bloodGroup}
                    </Text>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    label="Schließen"
                    theme="primary"
                    onPress={() => {
                        routeHome();
                    }}
                />
            </View>
        </View>
    );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
    },
    bodyContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
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
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    rowLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginVertical: 0,
        marginLeft: 40,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginVertical: 8,
    },
    textLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    textField: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#00bfff',
        borderRadius: 25,
        padding: 12,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
});
