import React, { ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PersonalDataScreen from '@/app/(tabs)/PersonalDataScreen';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import * as EncryptionModule from '@/utils/encryption';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/components/ui/TabBarBackground', () => ({
    useBottomTabOverflow: () => 16,
}));

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

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

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock(
    '@/components/ParallaxScrollView',
    () =>
        ({ children }: { children: ReactNode }) =>
            children
);

jest.mock('@/utils/encryption', () => ({
    generateKeyIfNotExists: jest.fn(),
    encryptData: jest.fn(),
    decryptData: jest.fn(),
}));

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => (console.error as jest.Mock).mockRestore());

describe('PersonalDataScreen', () => {
    const mockReplace = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });

        jest.clearAllMocks();

        (EncryptionModule.generateKeyIfNotExists as jest.Mock).mockResolvedValue(undefined);
        (EncryptionModule.encryptData as jest.Mock).mockImplementation((text) => Promise.resolve(`encrypted(${text})`));
        (EncryptionModule.decryptData as jest.Mock).mockImplementation((text) =>
            Promise.resolve(text.replace(/^encrypted\(/, '').replace(/\)$/, ''))
        );

        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
    });

    it('renders all input fields', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        ['inputName', 'inputAge', 'inputWeight', 'inputHeight', 'inputBloodGroup'].forEach((id) => expect(getByTestId(id)).toBeTruthy());
    });

    it('shows error on invalid name input', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputName'), '123!');
        expect(getByTestId('errorName')).toBeTruthy();
        expect(getByTestId('errorName')).toHaveTextContent('Bitte gib einen gültigen Namen ein.');
    });

    it('shows error on empty name input', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputName'), ' ');
        expect(getByTestId('errorName')).toHaveTextContent('Name darf nicht leer sein.');
    });

    it('accepts valid name without setting error', () => {
        const { getByTestId, queryByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputName'), 'Anna-Lena');
        expect(queryByTestId('errorName')).toBeNull();
    });

    it('shows error when age is non-numeric', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputAge'), 'abc');
        expect(getByTestId('errorAge')).toHaveTextContent('Nur ganze Zahlen erlaubt.');
    });

    it('shows error when age is too large', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputAge'), '250');
        expect(getByTestId('errorAge')).toHaveTextContent('Das maximale Alter ist 200 Jahre.');
    });

    it('shows error on invalid age input', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputAge'), '2');
        expect(getByTestId('errorAge')).toBeTruthy();
        expect(getByTestId('errorAge')).toHaveTextContent('Das Mindestalter ist 5 Jahre.');
    });

    it('shows error when weight is not a number', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputWeight'), 'abc');
        expect(getByTestId('errorWeight')).toHaveTextContent('Maximal zwei Nachkommastellen erlaubt.');
    });

    it('shows error when weight is negative', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputWeight'), '-10');
        expect(getByTestId('errorWeight')).toHaveTextContent('Gewicht darf nicht negativ sein.');
    });

    it('shows error when weight is too high', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputWeight'), '501');
        expect(getByTestId('errorWeight')).toHaveTextContent('Das maximale Gewicht ist 500 kg.');
    });

    it('shows error on invalid weight input', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputWeight'), '123.123');
        expect(getByTestId('errorWeight')).toBeTruthy();
        expect(getByTestId('errorWeight')).toHaveTextContent('Maximal zwei Nachkommastellen erlaubt.');
    });

    it('accepts valid weight input', () => {
        const { getByTestId, queryByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputWeight'), '75.5');
        expect(queryByTestId('errorWeight')).toBeNull();
    });

    it('shows error on empty input', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputHeight'), '');
        expect(getByTestId('errorHeight')).toHaveTextContent('Nur ganze Zahlen erlaubt.');
    });

    it('shows error when value is below minimum (e.g. -1)', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputHeight'), '-1');
        expect(getByTestId('errorHeight')).toHaveTextContent('Die Mindestgröße ist 0 cm.');
    });

    it('shows error when value is above maximum (e.g. 401)', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputHeight'), '401');
        expect(getByTestId('errorHeight')).toHaveTextContent('Die maximale Größe ist 400 cm.');
    });

    it('accepts valid minimum value (0)', () => {
        const { getByTestId, queryByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputHeight'), '0');
        expect(queryByTestId('errorHeight')).toBeNull();
    });

    it('accepts valid middle value (180)', () => {
        const { getByTestId, queryByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputHeight'), '180');
        expect(queryByTestId('errorHeight')).toBeNull();
    });

    it('accepts valid maximum value (400)', () => {
        const { getByTestId, queryByTestId } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputHeight'), '400');
        expect(queryByTestId('errorHeight')).toBeNull();
    });

    it('requires blood group selection', () => {
        const { getByTestId, getByText, queryByText } = render(<PersonalDataScreen />);
        fireEvent(getByTestId('inputBloodGroup'), 'onValueChange', '');
        expect(getByText(/Bitte wähle eine Blutgruppe aus/)).toBeTruthy();
        fireEvent(getByTestId('inputBloodGroup'), 'onValueChange', 'A+');
        expect(queryByText(/Bitte wähle eine Blutgruppe aus/)).toBeNull();
    });

    it('shows error on empty blood group', () => {
        const { getByTestId } = render(<PersonalDataScreen />);
        fireEvent(getByTestId('inputBloodGroup'), 'onValueChange', '');
        expect(getByTestId('errorBloodGroup')).toBeTruthy();
        expect(getByTestId('errorBloodGroup')).toHaveTextContent('Bitte wähle eine Blutgruppe aus.');
    });

    it('resets all errors on Abbruch button press', () => {
        const { getByTestId, getByText, queryByTestId } = render(<PersonalDataScreen />);

        fireEvent.changeText(getByTestId('inputAge'), '2');
        expect(getByTestId('errorAge')).toBeTruthy();

        fireEvent.press(getByText('Abbruch'));
        expect(queryByTestId('errorAge')).toBeNull();
    });

    it('saves data successfully', async () => {
        (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValueOnce(undefined);
        const { getByTestId, getByText } = render(<PersonalDataScreen />);

        fireEvent.changeText(getByTestId('inputName'), 'Max Mustermann');
        fireEvent.changeText(getByTestId('inputAge'), '25');
        fireEvent.changeText(getByTestId('inputWeight'), '80');
        fireEvent.changeText(getByTestId('inputHeight'), '180');
        fireEvent(getByTestId('inputBloodGroup'), 'onValueChange', 'A+');

        fireEvent.press(getByText('Speichern'));

        await waitFor(() => {
            expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    text1: 'Benutzerdaten',
                    text2: 'Die Daten wurden gespeichert!',
                })
            );
            expect(mockReplace).toHaveBeenCalledWith('/(tabs)/HomeScreen');
        });
    });

    it('deletes data and resets form', async () => {
        jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons) => {
            if (buttons?.[1]?.onPress) buttons[1].onPress();
        });
        (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);
        jest.spyOn(AsyncStorage, 'clear').mockResolvedValue(undefined);
        const { getByTestId, getByText } = render(<PersonalDataScreen />);
        fireEvent.changeText(getByTestId('inputName'), 'Test');
        fireEvent.press(getByText('Löschen'));
        await waitFor(() => {
            expect(FileSystem.deleteAsync).toHaveBeenCalledWith('/mock/documents/user_data.json', { idempotent: true });
            expect(AsyncStorage.clear).toHaveBeenCalled();
        });
    });

    it('creates file if it does not exist', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
        (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValueOnce(undefined);

        render(<PersonalDataScreen />);

        await waitFor(() => {
            expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
        });
    });

    it('logs error if loading fails', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockRejectedValueOnce(new Error('Fehler!'));

        render(<PersonalDataScreen />);

        await waitFor(() => {
            expect(Toast.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    text1: 'Benutzerdaten',
                    text2: 'Fehler beim Laden der Daten! Error: Fehler!',
                })
            );
        });
    });

    it('loads and decrypts data on mount', async () => {
        const userData = {
            name: 'Lisa',
            age: '30',
            weight: '65',
            height: '175',
            bloodGroup: 'AB+',
        };
        const encrypted = `encrypted(${JSON.stringify(userData)})`;

        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
            exists: true,
            uri: '/mock/documents/user_data.json',
        });
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(encrypted);

        const { getByTestId } = render(<PersonalDataScreen />);

        await waitFor(() => {
            expect(getByTestId('inputName')).toHaveProp('value', 'Lisa');
            expect(getByTestId('inputAge')).toHaveProp('value', '30');
            expect(getByTestId('inputWeight')).toHaveProp('value', '65');
            expect(getByTestId('inputHeight')).toHaveProp('value', '175');
        });
    });
});
