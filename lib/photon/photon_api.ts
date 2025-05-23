import { AddressInfo } from '../addressInfo';
import { PhotonResponse } from './photon_response';

const PHOTON_URL = 'https://photon.komoot.io';

export async function reverseGeocode(lat: number, lon: number): Promise<AddressInfo | null> {
    try {
        const response = await fetch(`${PHOTON_URL}/reverse?lat=${lat}&lon=${lon}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Photon API Fehler:', response.statusText);
            return null;
        }

        const data: PhotonResponse = await response.json();

        if (data.features.length === 0) return null;

        const props = data.features[0].properties;

        const addressInfo: AddressInfo = {
            country: props.country,
            postcode: props.postcode,
            city: props.city,
            street: props.street,
            house: props.housenumber,
        };

        return addressInfo;
    } catch (error) {
        console.error('Fehler bei der Reverse-Geocoding-Anfrage:', error);
        return null;
    }
}
