import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '@/app/(tabs)/HomeScreen';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

jest.mock('@/components/ui/TabBarBackground', () => ({
    useBottomTabOverflow: () => 16,
}));

describe('Home Screen', () => {
    it('sollte den Begrüßungstext anzeigen', () => {
        const { getByText } = render(<HomeScreen />);
        expect(getByText('Hallo, Max Mustermann!')).toBeTruthy();
    });

    it('sollte den Router zu "Rettung" weiterleiten, wenn der Rettung-Button gedrückt wird', () => {
        const mockReplace = jest.fn();
        jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({ replace: mockReplace });

        const { getByText } = render(<HomeScreen />);
        const rettungButton = getByText('Rettung 🚑');
        fireEvent.press(rettungButton);

        expect(mockReplace).toHaveBeenCalledWith('/(tabs)/HomeScreen'); //TODO replace with sub page Rettung ~ Jan
    });

    it('sollte den Router zu "Polizei" weiterleiten, wenn der Polizei-Button gedrückt wird', () => {
        const mockReplace = jest.fn();
        jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({ replace: mockReplace });

        const { getByText } = render(<HomeScreen />);
        const polizeiButton = getByText('Polizei 🚓');
        fireEvent.press(polizeiButton);

        expect(mockReplace).toHaveBeenCalledWith('/(tabs)/HomeScreen'); //TODO replace with sub page Polizei ~ Jan
    });

    it('sollte den Router zu "Feuerwehr" weiterleiten, wenn der Feuerwehr-Button gedrückt wird', () => {
        const mockReplace = jest.fn();
        jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({ replace: mockReplace });

        const { getByText } = render(<HomeScreen />);
        const feuerwehrButton = getByText('Feuerwehr 🚒');
        fireEvent.press(feuerwehrButton);

        expect(mockReplace).toHaveBeenCalledWith('/(tabs)/HomeScreen'); //TODO replace with sub page Feuerwehr ~ Jan
    });
});
