import React from 'react';
import { render } from '@testing-library/react-native';
import BlueLightButtonPolice from '@/app/(tabs)/BlueLightButtonPolice';
import * as Location from 'expo-location';

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
        default: ({}: { name: string; size: number; color: string }) => {
            return <></>;
        },
    };
});

jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: jest.fn(),
    getCurrentPositionAsync: jest.fn(),
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
}));

jest.mock('@/lib/find_department', () => ({
    findDepartment: jest.fn(async () => {
        return [
            {
                name: 'Teststation',
                city: 'Musterstadt',
                postcode: '12345',
                street: 'Musterstraße',
                house: '1A',
                lat: 51.5,
                lon: 9.5,
            },
        ];
    }),
}));

describe('BlueLightButtonPolice - Navigation Button', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('zeigt "Lädt..." an, während die Daten geladen werden', async () => {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
            coords: { latitude: 51.5, longitude: 9.5 },
        });

        const mockFindDepartment = jest.fn(async () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([
                        {
                            name: 'Teststation',
                            city: 'Musterstadt',
                            postcode: '12345',
                            street: 'Musterstraße',
                            house: '1A',
                            lat: 51.5,
                            lon: 9.5,
                        },
                    ]);
                }, 200);
            });
        });

        jest.mock('@/lib/find_department', () => ({
            findDepartment: mockFindDepartment,
        }));

        const { queryByText } = render(<BlueLightButtonPolice />);

        expect(queryByText('Lädt...')).toBeTruthy();
    });
});
