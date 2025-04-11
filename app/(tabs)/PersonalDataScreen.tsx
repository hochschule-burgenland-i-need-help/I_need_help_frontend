import Button from "@/components/Button";
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";

const LogoImage = require("@/assets/images/i_need_help_splash.jpg");
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];

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
  const userDataFile = FileSystem.documentDirectory + "user_data.json";

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [errorName, setErrorName] = useState<string | null>(null);
  const [errorAge, setErrorAge] = useState<string | null>(null);
  const [errorWeight, setErrorWeight] = useState<string | null>(null);
  const [errorHeight, setErrorHeight] = useState<string | null>(null);
  const [errorBloodGroup, setErrorBloodGroup] = useState<string | null>(null);

  const hasErrors = [errorName, errorAge, errorWeight, errorBloodGroup].some(
    (e) => e !== null
  );

  /**
   * Validates the user's name input and updates state and error messages accordingly.
   *
   * @param {string} value - The name entered by the user.
   */
  const validateName = (value: string) => {
    setName(value);

    const nameRegex = /^[A-Za-zÀ-ÿäöüÄÖÜß'\- ]{2,100}$/;

    if (value.trim() === "") {
      setErrorName("Name darf nicht leer sein.");
    } else if (!nameRegex.test(value)) {
      setErrorName(
        "Bitte gib einen gültigen Namen ein (keine Zahlen oder Sonderzeichen)."
      );
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
      setErrorAge("Nur ganze Zahlen erlaubt.");
    } else if (isNaN(intVal)) {
      setErrorAge("Ungültige Eingabe.");
    } else if (intVal < 5) {
      setErrorAge("Das Mindestalter ist 5 Jahre.");
    } else if (intVal > 200) {
      setErrorAge("Das maximale Alter ist 200 Jahre.");
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

    const normalized = value.replace(",", ".");
    const floatRegex = /^-?\d{0,3}(\.\d{0,2})?$/;

    if (!floatRegex.test(normalized)) {
      setErrorWeight("Maximal zwei Nachkommastellen erlaubt.");
      return;
    }

    const floatVal = parseFloat(normalized);

    if (isNaN(floatVal)) {
      setErrorWeight("Ungültige Eingabe.");
    } else if (floatVal < 0) {
      setErrorWeight("Gewicht darf nicht negativ sein.");
    } else if (floatVal > 500) {
      setErrorWeight("Das maximale Gewicht ist 500 kg.");
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
      setErrorHeight("Nur ganze Zahlen erlaubt.");
    } else if (isNaN(intVal)) {
      setErrorHeight("Ungültige Eingabe.");
    } else if (intVal < 0) {
      setErrorHeight("Die Mindestgröße ist 0 cm.");
    } else if (intVal > 400) {
      setErrorHeight("Das maximale Größe ist 400 cm.");
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

    if (value === "") {
      setErrorBloodGroup("Bitte wähle eine Blutgruppe aus.");
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
   * Saves the current user input data to the local file system.
   *
   * @param {boolean} [popup=true] - Whether to show a toast popup upon successful save.
   * @returns {Promise<void>} Resolves when the data has been saved successfully or logs an error.
   */
  const saveData = async (popup: boolean = true) => {
    const data = {
      name: name,
      age: age,
      weight: weight,
      height: height,
      bloodGroup: bloodGroup,
    };

    const jsonString = JSON.stringify(data, null, 2);

    try {
      await FileSystem.writeAsStringAsync(userDataFile, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log(`Datei gespeichert: Pfad: ${userDataFile}`);

      if (popup) {
        console.log("Toast aufrufen");
        Toast.show({
          type: "success",
          text1: "Benutzerdaten",
          text2: "Die Daten wurden gespeichert!",
          position: "top",
          autoHide: true,
          visibilityTime: 4000,
        });
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
    }
  };

  /**
   * Loads user data from the local file system and updates the input fields.
   *
   * If the file does not exist, it will initialize it with default values.
   *
   * @returns {Promise<void>} Resolves when the data has been successfully loaded or logs an error.
   */
  const loadData = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(userDataFile);
      if (fileInfo === null || !fileInfo?.exists) {
        await saveData(false);
        return;
      }

      const content = await FileSystem.readAsStringAsync(userDataFile, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const data = JSON.parse(content);

      setName(data.name || "");
      setAge(data.age?.toString() || "");
      setWeight(data.weight?.toString() || "");
      setHeight(data.height?.toString() || "");
      setBloodGroup(data.bloodGroup || "");

      console.log("Daten geladen!");
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#e71d1d", dark: "#e71d1d" }}
      headerImage={
        <Image testID="logo" source={LogoImage} style={styles.logo} />
      }
    >
      <ThemedView testID="bodyContainer" style={styles.bodyContainer}>
        <ThemedText testID="title" style={styles.title}>
          Meine Stammdaten
        </ThemedText>

        <PaperInput
          testID="inputName"
          label="Name"
          value={name}
          onChangeText={validateName}
          mode="flat"
          error={!!errorName}
          textColor="#444"
          style={styles.input}
        />
        {errorName && (
          <Text testID="errorName" style={styles.errorText}>
            {errorName}
          </Text>
        )}
        <PaperInput
          testID="inputAge"
          label="Alter"
          value={age}
          onChangeText={validateAge}
          mode="flat"
          error={!!errorAge}
          textColor="#444"
          style={styles.input}
          keyboardType="numeric"
        />
        {errorAge && (
          <Text testID="errorAge" style={styles.errorText}>
            {errorAge}
          </Text>
        )}
        <PaperInput
          testID="inputWeight"
          label="Gewicht in Kg"
          value={weight}
          onChangeText={validateWeight}
          mode="flat"
          error={!!errorWeight}
          textColor="#444"
          style={styles.input}
          keyboardType="decimal-pad"
        />
        {errorWeight && (
          <Text testID="errorWeight" style={styles.errorText}>
            {errorWeight}
          </Text>
        )}
        <PaperInput
          testID="inputHeight"
          label="Größe in cm"
          value={height}
          onChangeText={validateHeight}
          mode="flat"
          error={!!errorHeight}
          textColor="#444"
          style={styles.input}
          keyboardType="numeric"
        />
        {errorHeight && (
          <Text testID="errorHeight" style={styles.errorText}>
            {errorHeight}
          </Text>
        )}
        <Picker
          testID="inputBloodGroup"
          selectedValue={bloodGroup}
          onValueChange={validateBloodgroup}
          style={[styles.input, errorBloodGroup && styles.invalidInput]}
        >
          <Picker.Item label="Bitte Blutgruppe wählen..." value="" />
          {bloodGroups.map((group) => (
            <Picker.Item key={group} label={group} value={group} />
          ))}
        </Picker>
        {errorBloodGroup && (
          <Text testID="errorBloodGroup" style={styles.errorText}>
            {errorBloodGroup}
          </Text>
        )}
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Button
          label="OK"
          theme="primary"
          disabled={hasErrors}
          onPress={() => {
            saveData();
            resetErrors();
          }}
        />
        <Button
          label="Abbruch"
          theme="secondary"
          onPress={() => {
            resetErrors();
          }}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  headerContainer: {
    height: 120,
    backgroundColor: "#e71d1d",
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  bodyContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 20,
  },
  input: {
    width: "90%",
    height: 58,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#00bfff",
    borderRadius: 5,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  invalidInput: {
    width: "90%",
    backgroundColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "red",
    borderRadius: 5,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});
