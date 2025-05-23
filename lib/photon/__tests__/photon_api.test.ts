import { reverseGeocode } from '../photon_api';
import { AddressInfo } from '../../addressInfo';

global.fetch = jest.fn();

const mockResponse = {
    features: [
        {
            geometry: {
                coordinates: [16.2456067, 47.8121372],
                type: 'Point',
            },
            type: 'Feature',
            properties: {
                osm_type: 'N',
                osm_id: 6433671342,
                country: 'Österreich',
                osm_key: 'place',
                housenumber: '2',
                city: 'Wiener Neustadt',
                street: 'Neuklosterplatz',
                countrycode: 'AT',
                osm_value: 'house',
                postcode: '2700',
                state: 'Niederösterreich',
                type: 'house',
            },
        },
    ],
    type: 'FeatureCollection',
};

describe('reverseGeocode', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockReset();
    });

    it('should return parsed address info from photon response', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await reverseGeocode(47.8121372, 16.2456067);

        const expected: AddressInfo = {
            country: 'Österreich',
            postcode: '2700',
            city: 'Wiener Neustadt',
            street: 'Neuklosterplatz',
            house: '2',
        };

        expect(result).toEqual(expected);
    });

    it('should return null on failed fetch', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' });

        const result = await reverseGeocode(0, 0);
        expect(result).toBeNull();
    });

    it('should return null on empty feature list', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ features: [] }),
        });

        const result = await reverseGeocode(0, 0);
        expect(result).toBeNull();
    });

    it('should return null on thrown error', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

        const result = await reverseGeocode(0, 0);
        expect(result).toBeNull();
    });
});
