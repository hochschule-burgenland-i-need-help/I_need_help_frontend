export default {
    lib: {
        WordArray: {
            random: (length: number) => ({
                toString: () => 'mocked-random-key',
            }),
        },
    },
    AES: {
        encrypt: (text: string, key: string) => ({
            toString: () => `encrypted(${text})`,
        }),
        decrypt: (encrypted: string, key: string) => ({
            toString: () => encrypted.replace(/^encrypted\(/, '').replace(/\)$/, ''),
        }),
    },
    enc: {
        Utf8: 'Utf8',
    },
};
