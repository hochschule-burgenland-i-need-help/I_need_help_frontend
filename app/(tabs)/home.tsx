import React from "react";
import { Image, StyleSheet, Button } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";

const LogoImage = require("@/assets/images/i_need_help_splash.jpg");

const home = () => {
  const router = useRouter();

  const routeRettung = async () => {
    router.replace("/(tabs)/explore"); //TODO replace with sub page Rettung ~ Jan
  };
  const routeFeuerwehr = async () => {
    router.replace("/(tabs)/explore"); //TODO replace with sub page Feuerwehr ~ Jan
  };
  const routePolizei = async () => {
    router.replace("/(tabs)/explore"); //TODO replace with sub page Polizei ~ Jan
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#e71d1d", dark: "#e71d1d" }}
      headerImage={
        <Image testID="logo" source={LogoImage} style={styles.logo} />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText style={styles.text}>Hallo, Max Mustermann!</ThemedText>
        <ThemedView style={styles.button}>
          <Button title="Rettung 🚑" onPress={routeRettung} color="red" />
          <Button title="Polizei 🚓" onPress={routePolizei} color="blue" />
          <Button title="Feuerwehr 🚒" onPress={routeFeuerwehr} color="green" />
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 10,
    resizeMode: "contain",
  },
  text: {
    fontSize: 16,
    marginBottom: 32,
  },
  button: {
    flexDirection: "column",
    fontSize: 32,
    gap: 10,
  },
});
