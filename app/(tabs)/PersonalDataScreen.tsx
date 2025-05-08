import Button from '@/components/Button';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Text, StyleSheet, Image, Alert, View, Pressable } from 'react-native';
import { TextInput as PaperInput } from 'react-native-paper';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { generateKeyIfNotExists, encryptData, decryptData } from '@/utils/encryption';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const LogoImage = require('@/assets/images/i_need_help_splash.jpg');
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

/**
 * PersonalDataScreen is a React Native screen component that allows users
 * to enter and persist basic personal information (name, age, weight, height, blood group).
 *
 * User data is stored locally on the device using Expo FileSystem API.
 * Inputs are validated and errors are displayed inline.
 *
 * @returns {JSX.Element} The rendered screen for entering and managing personal data.
 */
export default function PersonalDataScreen() {
    const router = useRouter();
    const userDataFile = FileSystem.documentDirectory + 'user_data.json';

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [errorName, setErrorName] = useState<string | null>(null);
    const [errorAge, setErrorAge] = useState<string | null>(null);
    const [errorWeight, setErrorWeight] = useState<string | null>(null);
    const [errorHeight, setErrorHeight] = useState<string | null>(null);
    const [errorBloodGroup, setErrorBloodGroup] = useState<string | null>(null);

    const hasErrors = [errorName, errorAge, errorWeight, errorHeight, errorBloodGroup].some((e) => e !== null);

    const routeHome = async () => {
        router.replace('/(tabs)/HomeScreen');
    };

    /**
     * Validates the user's name input and updates state and error messages accordingly.
     *
     * @param {string} value - The name entered by the user.
     */
    const validateName = (value: string) => {
        setName(value);

        const nameRegex = /^[A-Za-zÀ-ÿäöüÄÖÜß'\- ]{2,100}$/;

        if (value.trim() === '') {
            setErrorName('Name darf nicht leer sein.');
        } else if (!nameRegex.test(value)) {
            setErrorName('Bitte gib einen gültigen Namen ein.');
        } else {
            setErrorName(null);
        }
    };

    /**
     * Validates the user's age input and updates state and error messages accordingly.
     *
     * @param {string} value - The age entered by the user. Must be a whole number between 5 and 200.
     */
    const validateAge = (value: string) => {
        setAge(value);

        const intVal = parseInt(value, 10);

        if (!/^-?\d+$/.test(value)) {
            setErrorAge('Nur ganze Zahlen erlaubt.');
        } else if (isNaN(intVal)) {
            setErrorAge('Ungültige Eingabe.');
        } else if (intVal < 5) {
            setErrorAge('Das Mindestalter ist 5 Jahre.');
        } else if (intVal > 200) {
            setErrorAge('Das maximale Alter ist 200 Jahre.');
        } else {
            setErrorAge(null);
        }
    };

    /**
     * Validates the user's weight input and updates state and error messages accordingly.
     *
     * @param {string} value - The weight entered by the user in kilograms (max. 2 decimal places, 0–500).
     */
    const validateWeight = (value: string) => {
        setWeight(value);

        const normalized = value.replace(',', '.');
        const floatRegex = /^-?\d{0,3}(\.\d{0,2})?$/;

        if (!floatRegex.test(normalized)) {
            setErrorWeight('Maximal zwei Nachkommastellen erlaubt.');
            return;
        }

        const floatVal = parseFloat(normalized);

        if (isNaN(floatVal)) {
            setErrorWeight('Ungültige Eingabe.');
        } else if (floatVal < 0) {
            setErrorWeight('Gewicht darf nicht negativ sein.');
        } else if (floatVal > 500) {
            setErrorWeight('Das maximale Gewicht ist 500 kg.');
        } else {
            setErrorWeight(null);
        }
    };

    /**
     * Validates the user's height input and updates state and error messages accordingly.
     *
     * @param {string} value - The height entered by the user in centimeters (whole number between 5 and 400).
     */
    const validateHeight = (value: string) => {
        setHeight(value);

        const intVal = parseInt(value, 10);

        if (!/^-?\d+$/.test(value)) {
            setErrorHeight('Nur ganze Zahlen erlaubt.');
        } else if (isNaN(intVal)) {
            setErrorHeight('Ungültige Eingabe.');
        } else if (intVal < 0) {
            setErrorHeight('Die Mindestgröße ist 0 cm.');
        } else if (intVal > 400) {
            setErrorHeight('Die maximale Größe ist 400 cm.');
        } else {
            setErrorHeight(null);
        }
    };

    /**
     * Validates the selected blood group and updates state and error messages accordingly.
     *
     * @param {string} value - The selected blood group. Must be one of the predefined options.
     */
    const validateBloodgroup = (value: string) => {
        setBloodGroup(value);

        if (value === '') {
            setErrorBloodGroup('Bitte wähle eine Blutgruppe aus.');
        } else {
            setErrorBloodGroup(null);
        }
    };

    /**
     * Clears all current validation error messages from the form.
     */
    const resetErrors = () => {
        setErrorName(null);
        setErrorAge(null);
        setErrorWeight(null);
        setErrorHeight(null);
        setErrorBloodGroup(null);
    };

    /**
     * Prompts the user with a confirmation alert before deleting all saved data.
     * If confirmed, it triggers the `deleteAllData` function.
     */
    const confirmDelete = () => {
        Alert.alert(
            'Daten löschen?',
            'Möchten Sie wirklich alle Gesundheitsdaten unwiderruflich löschen?',
            [
                { text: 'Abbruch', style: 'cancel' },
                { text: 'Ja', onPress: () => deleteAllData() },
            ],
            { cancelable: true }
        );
    };

    /**
     * Deletes all stored user data including encrypted file and local storage.
     * Resets all input fields and optionally shows a confirmation popup.
     *
     * @param {boolean} [showPopup=true] - Whether to display a confirmation alert after deletion.
     * @returns {Promise<void>} Resolves when deletion is complete or logs an error.
     */
    const deleteAllData = async (showPopup: boolean = true) => {
        try {
            await FileSystem.deleteAsync(userDataFile, { idempotent: true });
            await AsyncStorage.clear();
            setName('');
            setAge('');
            setWeight('');
            setHeight('');
            setBloodGroup('');
            resetErrors();
            if (showPopup) {
                Alert.alert('Daten gelöscht', 'Alle Gesundheitsdaten wurden entfernt.');
            }
        } catch (error) {
            console.error('Fehler beim Löschen der Daten:', error);
            Alert.alert('Fehler', 'Die Daten konnten nicht gelöscht werden.');
        }
    };

    /**
     * Saves the current user input data encrypted to the local file system.
     *
     * @param {boolean} [popup=true] - Whether to show a toast popup upon successful save.
     * @returns {Promise<Boolean>} Resolves when the data has been saved successfully or logs an error.
     */
    const saveData = async (popup: boolean = true): Promise<boolean> => {
        const data = {
            name: name,
            age: age,
            weight: weight,
            height: height,
            bloodGroup: bloodGroup,
        };

        const jsonString = JSON.stringify(data, null, 2);
        const encrypted = await encryptData(jsonString);

        try {
            await FileSystem.writeAsStringAsync(userDataFile, encrypted, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (popup) {
                Toast.show({
                    type: 'success',
                    text1: 'Benutzerdaten',
                    text2: 'Die Daten wurden gespeichert!',
                    position: 'top',
                    autoHide: true,
                    visibilityTime: 3000,
                });
            }
            return true;
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Benutzerdaten',
                text2: 'Fehler beim Speichern der Daten! ' + error,
                position: 'top',
                autoHide: true,
                visibilityTime: 4000,
            });
        }

        return false;
    };

    /**
     * Loads encrypted user data from the local file system, decrypt it and updates the input fields.
     *
     * If the file does not exist, it will initialize it with default values.
     *
     * @returns {Promise<void>} Resolves when the data has been successfully loaded or logs an error.
     */
    const loadData = async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(userDataFile);
            if (!fileInfo?.exists) {
                await saveData(false);
                return;
            }

            const encryptedContent = await FileSystem.readAsStringAsync(userDataFile, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            const decrypted = await decryptData(encryptedContent);
            const data = JSON.parse(decrypted);

            setName(data.name || '');
            setAge(data.age?.toString() || '');
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

    useFocusEffect(
        useCallback(() => {
            (async () => {
                await generateKeyIfNotExists();
                await loadData();
            })();
        }, [])
    );

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#e71d1d', dark: '#e71d1d' }}
            headerImage={<Image testID="logo" source={LogoImage} style={styles.logo} />}>
            <ThemedView testID="bodyContainer" style={styles.bodyContainer}>
                <ThemedText testID="title" style={styles.title}>
                    Meine Stammdaten
                </ThemedText>

                <View style={styles.inputRow}>
                    <PaperInput
                        testID="inputName"
                        label="Name"
                        value={name}
                        onChangeText={validateName}
                        mode="flat"
                        error={!!errorName}
                        textColor="#444"
                        style={styles.inputField}
                    />
                    <Pressable
                        onPress={() => {
                            setName('');
                            setErrorName(null);
                        }}
                        style={styles.clearIcon}>
                        <Text style={styles.clearText}>🗑️</Text>
                    </Pressable>
                </View>
                {errorName && (
                    <Text testID="errorName" style={styles.errorText}>
                        {errorName}
                    </Text>
                )}
                <View style={styles.inputRow}>
                    <PaperInput
                        testID="inputAge"
                        label="Alter"
                        value={age}
                        onChangeText={validateAge}
                        mode="flat"
                        error={!!errorAge}
                        keyboardType="numeric"
                        textColor="#444"
                        style={styles.inputField}
                    />
                    <Pressable
                        onPress={() => {
                            setAge('');
                            setErrorAge(null);
                        }}
                        style={styles.clearIcon}>
                        <Text style={styles.clearText}>🗑️</Text>
                    </Pressable>
                </View>
                {errorAge && (
                    <Text testID="errorAge" style={styles.errorText}>
                        {errorAge}
                    </Text>
                )}

                <View style={styles.inputRow}>
                    <PaperInput
                        testID="inputWeight"
                        label="Gewicht in Kg"
                        value={weight}
                        onChangeText={validateWeight}
                        mode="flat"
                        error={!!errorWeight}
                        keyboardType="decimal-pad"
                        textColor="#444"
                        style={styles.inputField}
                    />
                    <Pressable
                        onPress={() => {
                            setWeight('');
                            setErrorWeight(null);
                        }}
                        style={styles.clearIcon}>
                        <Text style={styles.clearText}>🗑️</Text>
                    </Pressable>
                </View>
                {errorWeight && (
                    <Text testID="errorWeight" style={styles.errorText}>
                        {errorWeight}
                    </Text>
                )}

                <View style={styles.inputRow}>
                    <PaperInput
                        testID="inputHeight"
                        label="Größe in cm"
                        value={height}
                        onChangeText={validateHeight}
                        mode="flat"
                        error={!!errorHeight}
                        keyboardType="numeric"
                        textColor="#444"
                        style={styles.inputField}
                    />
                    <Pressable
                        onPress={() => {
                            setHeight('');
                            setErrorHeight(null);
                        }}
                        style={styles.clearIcon}>
                        <Text style={styles.clearText}>🗑️</Text>
                    </Pressable>
                </View>
                {errorHeight && (
                    <Text testID="errorHeight" style={styles.errorText}>
                        {errorHeight}
                    </Text>
                )}

                <View style={styles.inputRow}>
                    <Picker
                        testID="inputBloodGroup"
                        selectedValue={bloodGroup}
                        onValueChange={validateBloodgroup}
                        style={[styles.pickerField, errorBloodGroup && styles.invalidInput]}>
                        <Picker.Item label="Bitte Blutgruppe wählen..." value="" />
                        {bloodGroups.map((group) => (
                            <Picker.Item key={group} label={group} value={group} />
                        ))}
                    </Picker>
                    <Pressable
                        onPress={() => {
                            setBloodGroup('');
                            setErrorBloodGroup(null);
                        }}
                        style={styles.clearIcon}>
                        <Text style={styles.clearText}>🗑️</Text>
                    </Pressable>
                </View>
                {errorBloodGroup && (
                    <Text testID="errorBloodGroup" style={styles.errorText}>
                        {errorBloodGroup}
                    </Text>
                )}
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <Button
                    label="Speichern"
                    theme="primary"
                    disabled={hasErrors}
                    onPress={async () => {
                        const retval = await saveData();
                        if (retval === true) {
                            resetErrors();
                            routeHome();
                        }
                    }}
                />
                <Button label="Löschen" theme="third" onPress={confirmDelete} disabled={false} />
                <Button label="Abbruch" theme="secondary" onPress={resetErrors} />
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
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
    logo: {
        width: 100,
        height: 100,
        marginTop: 10,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginVertical: 8,
    },
    inputField: {
        flex: 1,
        height: 58,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#00bfff',
        borderRadius: 5,
        padding: 12,
        fontSize: 16,
    },
    pickerField: {
        flex: 1,
        height: 58,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#00bfff',
        borderRadius: 5,
        marginRight: 8,
    },
    clearIcon: {
        marginLeft: 8,
    },
    clearText: {
        fontSize: 20,
    },
    invalidInput: {
        borderBottomWidth: 3,
        borderBottomColor: 'red',
    },
    errorText: {
        color: 'red',
        marginTop: 5,
        marginBottom: -5,
    },
});
