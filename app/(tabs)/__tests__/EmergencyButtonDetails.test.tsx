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
        await setupTest(PoliceComponent, '112');
    });

    it('zeigt Rettungsnummer korrekt an', async () => {
        const AmbulanceComponent = require('@/app/(tabs)/BlueLightButtonAmbulance').default;
        await setupTest(AmbulanceComponent, '112');
    });

    it('öffnet Telefonnummer beim Klick auf Anrufen', async () => {
        const PoliceComponent = require('@/app/(tabs)/BlueLightButtonPolice').default;
        const { getByText } = await setupTest(PoliceComponent, '112');
        const callButton = getByText('Anrufen');
        fireEvent.press(callButton);
        expect(Linking.openURL).toHaveBeenCalledWith('tel:112');
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

    it('zeigt fallback Info bei Standortfehler', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Location error'));

        const FireComponent = require('@/app/(tabs)/BlueLightButtonFireDepartment').default;
        const { findByText } = render(<FireComponent />);
        const fallbackText = await findByText(/112 ist die EU-weite Notrufnummer/);
        expect(fallbackText).toBeTruthy();
    });

    it('zeigt Adresse korrekt an, wenn Department verfügbar ist', async () => {
        jest.doMock('@/lib/find_department', () => ({
            findDepartment: async () => [
                {
                    name: 'Teststation',
                    city: 'Musterstadt',
                    postcode: '12345',
                    street: 'Musterstraße',
                    house: '1A',
                },
            ],
        }));

        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 51.5, longitude: 9.5 },
        });

        const PoliceComponent = require('@/app/(tabs)/BlueLightButtonPolice').default;
        const { getByTestId } = render(<PoliceComponent />);

        // Warte auf Adresse
        waitFor(() => {
            expect(getByTestId('testName').props.children.join('')).toContain('Teststation');
            expect(getByTestId('testCity').props.children.join('')).toContain('Musterstadt, 12345');
            expect(getByTestId('testStreet').props.children.join('')).toContain('Musterstraße 1A');
        });
    });
});
