import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DisclaimerScreen from '@/app/(modals)/DisclaimerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
}));

describe('DisclaimerScreen', () => {
    it('sollte den Disclaimer speichern und weiterleiten bei "Akzeptieren"', async () => {
        const { getByText } = render(<DisclaimerScreen />);
        const acceptButton = getByText('Akzeptieren');

        fireEvent.press(acceptButton);

        await waitFor(() => {
            expect(AsyncStorage.setItem).toHaveBeenCalledWith('disclaimerAccepted', 'true');
        });
    });

    it('sollte Alert anzeigen bei "Ablehnen"', () => {
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        const { getByText } = render(<DisclaimerScreen />);
        const declineButton = getByText('Ablehnen');

        fireEvent.press(declineButton);

        expect(alertSpy).toHaveBeenCalledWith(
            'Zustimmung erforderlich',
            'Ohne Zustimmung kann die App nicht genutzt werden.',
            expect.arrayContaining([
                expect.objectContaining({
                    text: 'App schließen',
                    onPress: expect.any(Function),
                }),
            ])
        );

        alertSpy.mockRestore();
    });
});
