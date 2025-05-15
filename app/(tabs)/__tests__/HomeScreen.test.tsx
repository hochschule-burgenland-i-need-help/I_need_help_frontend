import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomeScreen from '@/app/(tabs)/HomeScreen';
import * as Location from 'expo-location';
import { ViewProps } from 'react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

jest.mock('expo-location');

jest.mock('@/constants/custom.geo.json', () => ({
    features: [
        {
            type: 'Feature',
            properties: { name: 'Germany' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [9, 51],
                        [10, 51],
                        [10, 52],
                        [9, 52],
                        [9, 51],
                    ],
                ],
            },
        },
    ],
}));

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        FontAwesome: (props: ViewProps & { name: string; size?: number; color?: string }) => <View {...props} />,
    };
});

describe('HomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('zeigt Begrüßungstext an', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 51.5, longitude: 9.5 },
        });

        const { findByText } = render(<HomeScreen />);
        const greeting = await findByText('Hallo, Max Mustermann!');
        expect(greeting).toBeTruthy();
    });

    it('ruft Location-Berechtigung und Koordinaten ab', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 51.5, longitude: 9.5 },
        });

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        render(<HomeScreen />);

        await waitFor(() => {
            expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
            expect(Location.getCurrentPositionAsync).toHaveBeenCalled();

            // Prüfe nur auf "Standort:" und dann GeoJSON-Objekt
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Standort:'));
            expect(logSpy).toHaveBeenCalledWith({ name: 'Germany' });
        });

        logSpy.mockRestore();
    });

    it('zeigt Fehlermeldung bei fehlender Berechtigung', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        render(<HomeScreen />);

        await waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith('Standortberechtigung abgelehnt.');
        });

        logSpy.mockRestore();
    });
});
