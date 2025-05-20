import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { decryptData } from '@/utils/encryption';

const USER_DATA_FILE = FileSystem.documentDirectory + 'user_data.json';

export function useUserName() {
    const [name, setName] = useState<string>('');

    useEffect(() => {
        (async () => {
            try {
                const info = await FileSystem.getInfoAsync(USER_DATA_FILE);
                if (!info.exists) return;
                const encrypted = await FileSystem.readAsStringAsync(USER_DATA_FILE, {
                    encoding: FileSystem.EncodingType.UTF8,
                });
                const decrypted = await decryptData(encrypted);
                const data = JSON.parse(decrypted);
                setName(data.name ?? '');
            } catch (e) {
                console.error('useUserName: Fehler beim Laden des Namens', e);
            }
        })();
    }, []);

    return name;
}
