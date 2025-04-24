import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });
    const [isDisclaimer, setIsDisclaimer] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkDisclaimer = async () => {
            const accepted = await AsyncStorage.getItem('disclaimerAccepted');

            if (accepted === 'true') {
                setIsDisclaimer(false);
                router.replace('/(tabs)/HomeScreen');
            } else {
                setIsDisclaimer(true);
                router.replace('/(modals)/DisclaimerScreen');
            }

            SplashScreen.hideAsync();
        };

        if (loaded) {
            checkDisclaimer();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    if (isDisclaimer === false) {
        return (
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <PaperProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="+not-found" />
                    </Stack>
                    <Toast />
                    <StatusBar style="auto" />
                </PaperProvider>
            </ThemeProvider>
        );
    } else {
        return (
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <PaperProvider>
                    <Slot />
                    <Toast />
                    <StatusBar style="auto" />
                </PaperProvider>
            </ThemeProvider>
        );
    }
}
