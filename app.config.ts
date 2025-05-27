import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
    name: 'i-need-help',
    slug: 'i-need-help',
    version: '1.0.0',
    scheme: 'ineedhelp',
    android: {
        package: 'com.anonymous.ineedhelp',
        config: {
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_API_KEY,
            },
        },
    },
};

export default config;
