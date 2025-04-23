import * as SecureStore from 'expo-secure-store';
import { generateKeyIfNotExists, encryptData, decryptData } from '../encryption';

jest.mock('crypto-es');

jest.mock('expo-secure-store');

describe('Encryption Module', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('generates key if not exists', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
        (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

        await generateKeyIfNotExists();

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('i-need-help_encryption-key', 'mocked-random-key');
    });

    it('does not regenerate key if one exists', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('existing-key');

        await generateKeyIfNotExists();

        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('encrypts data using the key from SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-key');

        const result = await encryptData('{"test": true}');
        expect(result).toBe('encrypted({"test": true})');
    });

    it('throws if no key found during encryption', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

        await expect(encryptData('test')).rejects.toThrow('Kein Schlüssel vorhanden!');
    });

    it('decrypts data using the key from SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('test-key');

        const result = await decryptData('encrypted({"test": true})');
        expect(result).toBe('{"test": true}');
    });

    it('throws if no key found during decryption', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

        await expect(decryptData('data')).rejects.toThrow('Kein Schlüssel vorhanden!');
    });
});
