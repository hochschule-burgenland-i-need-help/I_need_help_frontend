import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import EmergencyScreen from '@/app/(tabs)/EmergencyScreen';
import * as FileSystem from 'expo-file-system';
import { decryptData } from '@/utils/encryption';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as EncryptionModule from '@/utils/encryption';
import { StyleSheet } from 'react-native';

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('expo-keep-awake', () => ({
    useKeepAwake: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    documentDirectory: '/mock/documents/',
    EncodingType: {
        UTF8: 'utf8',
    },
    getInfoAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('@/utils/encryption', () => ({
    decryptData: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (cb: () => void | (() => void)) => cb(),
}));

describe('EmergencyScreen', () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });

        jest.clearAllMocks();

        (EncryptionModule.decryptData as jest.Mock).mockImplementation((text) =>
            Promise.resolve(text.replace(/^encrypted\(/, '').replace(/\)$/, ''))
        );

        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
    });

    it('renders all labels correctly', async () => {
        const userData = {
            name: 'Max Mustermann',
            date: new Date(new Date().getFullYear() - 25, new Date().getMonth(), new Date().getDay()),
            weight: '70',
            height: '180',
            bloodGroup: 'A+',
        };
        const encrypted = `encrypted(${JSON.stringify(userData)})`;
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
            exists: true,
            uri: '/mock/documents/user_data.json',
        });
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(encrypted);

        const { getByTestId } = render(<EmergencyScreen />);

        await waitFor(() => {
            expect(getByTestId('title').props.children).toBe('SOS');
            expect(getByTestId('labelName')).toBeTruthy();
            expect(getByTestId('labelAge')).toBeTruthy();
            expect(getByTestId('labelWeight')).toBeTruthy();
            expect(getByTestId('labelHeight')).toBeTruthy();
            expect(getByTestId('labelBloodGroup')).toBeTruthy();
        });

        await waitFor(() => {
            expect(getByTestId('title').props.children).toBe('SOS');
            expect(getByTestId('name').props.children).toBe('Max Mustermann');
            expect(getByTestId('age').props.children).toBe(25);
            expect(getByTestId('weight').props.children).toStrictEqual(['70', ' kg']);
            expect(getByTestId('height').props.children).toStrictEqual(['180', ' cm']);
            expect(getByTestId('bloodGroup').props.children).toBe('A+');
        });
    });

    it('shows error toast if loading fails', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(new Error('read error'));

        render(<EmergencyScreen />);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    text1: 'Benutzerdaten',
                    text2: expect.stringContaining('Fehler beim Laden der Daten!'),
                })
            );
        });
    });

    it('does not load data if file does not exist', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

        render(<EmergencyScreen />);

        expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
        expect(decryptData).not.toHaveBeenCalled();
    });

    it('navigates to HomeScreen on button press', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

        const { getByText } = render(<EmergencyScreen />);
        const button = getByText('Schließen');

        fireEvent.press(button);

        expect(mockReplace).toHaveBeenCalledWith('/(tabs)/HomeScreen');
    });

    it('toggles background color periodically', () => {
        jest.useFakeTimers();

        const { getByTestId } = render(<EmergencyScreen />);
        const screen = getByTestId('outerContainer');

        expect(screen).not.toBeNull();

        const getBackgroundColor = () => {
            const flattened = StyleSheet.flatten(screen?.props.style);
            return flattened?.backgroundColor;
        };

        const initialColor = getBackgroundColor();

        act(() => {
            jest.advanceTimersByTime(600);
        });

        const toggledColor = getBackgroundColor();

        expect(initialColor).not.toEqual(toggledColor);

        jest.useRealTimers();
    });
});
