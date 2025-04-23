import * as SecureStore from 'expo-secure-store';
import CryptoES from 'crypto-es';

const KEY_NAME = 'i-need-help_encryption-key';

/**
 * Generates a new AES encryption key and stores it in SecureStore
 * if it doesn't already exist.
 *
 * @returns {Promise<void>} Resolves when key is generated or already exists.
 */
export async function generateKeyIfNotExists(): Promise<void> {
    const existingKey = await SecureStore.getItemAsync(KEY_NAME);
    if (!existingKey) {
        const randomKey = CryptoES.lib.WordArray.random(32).toString();
        await SecureStore.setItemAsync(KEY_NAME, randomKey);
    }
}

/**
 * Encrypts a JSON string using AES with a key stored in SecureStore.
 *
 * @param {string} jsonString - The plaintext JSON string to encrypt.
 * @returns {Promise<string>} A promise that resolves to the encrypted string.
 * @throws {Error} If the encryption key is not found.
 */
export async function encryptData(jsonString: string): Promise<string> {
    const key = await SecureStore.getItemAsync(KEY_NAME);
    if (!key) {
        throw new Error('Kein Schlüssel vorhanden!');
    }
    const encrypted = CryptoES.AES.encrypt(jsonString, key).toString();
    return encrypted;
}

/**
 * Decrypts an AES-encrypted string using a key stored in SecureStore.
 *
 * @param {string} encryptedData - The AES-encrypted data string.
 * @returns {Promise<string>} A promise that resolves to the decrypted JSON string.
 * @throws {Error} If the encryption key is not found or decryption fails.
 */
export async function decryptData(encryptedData: string): Promise<string> {
    const key = await SecureStore.getItemAsync(KEY_NAME);
    if (!key) {
        throw new Error('Kein Schlüssel vorhanden!');
    }

    const decrypted = CryptoES.AES.decrypt(encryptedData, key).toString(CryptoES.enc.Utf8);

    return decrypted;
}
