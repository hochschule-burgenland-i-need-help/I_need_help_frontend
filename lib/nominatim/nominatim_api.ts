import { AddressInfo } from '../addressInfo';

const NOMINATIM_URL = `https://nominatim.openstreetmap.org`;

export async function reverseGeocode(lat: number, lon: number): Promise<AddressInfo | null> {
    try {
        const query = `${NOMINATIM_URL}/reverse?lat=${lat}&lon=${lon}&format=json`;
        console.log(query);
        const response = await fetch(query, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'User-Agent': 'I-need-help/1.0 (2310859015@hochschule-burgenland.at)',
            },
        });

        console.log(response);
        if (!response.ok) {
            console.error('Nominatim API Fehler:', response.statusText);
            return null;
        }

        const data = await response.json();

        const address = data.address;

        if (!address) {
            console.warn('Nominatim JSON: keine Adresse gefunden');
            return null;
        }

        const info: AddressInfo = {
            country: address.country,
            city: address.city || address.city_district || address.town,
            postcode: address.postcode,
            street: address.road,
            house: address.house_number,
        };

        return info;
    } catch (error) {
        console.error('Fehler bei der Reverse-Geocoding-Anfrage:', error);
        return null;
    }
}
