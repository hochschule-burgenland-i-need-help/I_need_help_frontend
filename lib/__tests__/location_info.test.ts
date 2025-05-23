import { toLocationInfo } from '../location_info';
import { OverpassElement } from '../osm/overpass_element';
import * as nominatimApi from '../nominatim/nominatim_api';

jest.mock('../nominatim/nominatim_api');

describe('toLocationInfo', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should use tags for address if available', async () => {
        const element: OverpassElement = {
            id: 1,
            lat: 48.2,
            lon: 16.3,
            type: 'node',
            tags: {
                name: 'Krankenhaus A',
                'addr:street': 'Teststraße',
                'addr:housenumber': '5',
                'addr:postcode': '1010',
                'addr:city': 'Wien',
                phone: '+43 123 456',
                website: 'https://example.com',
            },
        };

        const result = await toLocationInfo(element);

        expect(result).toEqual({
            id: 1,
            name: 'Krankenhaus A',
            lat: 48.2,
            lon: 16.3,
            address: 'Teststraße 5, 1010 Wien',
            street: 'Teststraße',
            house: '5',
            postcode: '1010',
            city: 'Wien',
            phone: '+43 123 456',
            website: 'https://example.com',
        });
    });

    it('should call reverseGeocode if no address tags present', async () => {
        const element: OverpassElement = {
            id: 2,
            lat: 48.3,
            lon: 16.4,
            type: 'node',
            tags: {
                name: 'Feuerwehr B',
            },
        };

        (nominatimApi.reverseGeocode as jest.Mock).mockResolvedValue({
            street: 'Hauptstraße',
            house: '10',
            postcode: '1020',
            city: 'Wien',
            country: 'AT',
        });

        const result = await toLocationInfo(element);

        expect(nominatimApi.reverseGeocode).toHaveBeenCalledWith(48.3, 16.4);

        expect(result).toEqual({
            id: 2,
            name: 'Feuerwehr B',
            lat: 48.3,
            lon: 16.4,
            address: 'Hauptstraße 10, 1020 Wien',
            street: 'Hauptstraße',
            house: '10',
            postcode: '1020',
            city: 'Wien',
            phone: undefined,
            website: undefined,
        });
    });

    it('should handle missing name and use housename fallback', async () => {
        const element: OverpassElement = {
            id: 3,
            lat: 48.1,
            lon: 16.1,
            type: 'node',
            tags: {
                'addr:housename': 'Station Z',
                'addr:street': 'Nebenstraße',
                'addr:housenumber': '9',
                'addr:postcode': '1030',
                'addr:city': 'Wien',
            },
        };

        const result = await toLocationInfo(element);

        expect(result?.name).toBe('Station Z');
    });
});
