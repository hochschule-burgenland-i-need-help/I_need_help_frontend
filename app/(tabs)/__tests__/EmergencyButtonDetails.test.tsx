import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Linking } from 'react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('expo-location');

jest.mock('@/constants/custom.geo.json', () => ({
    features: [
        {
            type: 'Feature',
            properties: { iso_a2: 'DE', name: 'Germany' },
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

jest.mock('@expo/vector-icons/AntDesign', () => {
    return {
        __esModule: true,
        default: ({ name, size, color }: { name: string; size: number; color: string }) => {
            return <></>;
        },
    };
});

jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
}));

const setupTest = async (ScreenComponent: React.FC, expectedNumber: string) => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: { latitude: 51.5, longitude: 9.5 },
    });

    const utils = render(<ScreenComponent />);
    await waitFor(() => {
        expect(utils.queryByText(`Nummer: ${expectedNumber}`)).toBeTruthy();
    });
    return utils;
};

describe('Emergency Service Screens', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('zeigt Feuerwehrnummer korrekt an', async () => {
        const FireComponent = require('@/app/(tabs)/BlueLightButtonFireDepartment').default;
        await setupTest(FireComponent, '112');
    });

    it('zeigt Polizeinummer korrekt an', async () => {
        const PoliceComponent = require('@/app/(tabs)/BlueLightButtonPolice').default;
        await setupTest(PoliceComponent, '110');
    });

    it('zeigt Rettungsnummer korrekt an', async () => {
        const AmbulanceComponent = require('@/app/(tabs)/BlueLightButtonAmbulance').default;
        await setupTest(AmbulanceComponent, '112');
    });

    it('öffnet Telefonnummer beim Klick auf Anrufen', async () => {
        const PoliceComponent = require('@/app/(tabs)/BlueLightButtonPolice').default;
        const { getByText } = await setupTest(PoliceComponent, '110');
        const callButton = getByText('Anrufen');
        fireEvent.press(callButton);
        expect(Linking.openURL).toHaveBeenCalledWith('tel:110');
    });

    it('zeigt EU-Fallback bei unbekanntem Land', async () => {
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 0, longitude: 0 },
        });
        const RescueComponent = require('@/app/(tabs)/BlueLightButtonAmbulance').default;
        const { findByText } = render(<RescueComponent />);
        const fallbackText = await findByText(/112 ist die EU-weite Notrufnummer/);
        expect(fallbackText).toBeTruthy();
    });
});
