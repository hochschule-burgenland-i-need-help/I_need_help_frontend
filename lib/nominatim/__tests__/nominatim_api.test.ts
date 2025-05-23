import { reverseGeocode } from '../nominatim_api';
import { AddressInfo } from '../../addressInfo';

global.fetch = jest.fn();

const mockResponse = {
    place_id: 60141984,
    licence: 'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
    osm_type: 'node',
    osm_id: 6433671342,
    lat: '47.8121372',
    lon: '16.2456067',
    class: 'place',
    type: 'house',
    place_rank: 30,
    importance: 0.0000646761272601971,
    addresstype: 'place',
    name: '',
    display_name: '2, Neuklosterplatz, Wiener Neustadt, Niederösterreich, 2700, Österreich',
    address: {
        house_number: '2',
        road: 'Neuklosterplatz',
        town: 'Wiener Neustadt',
        state: 'Niederösterreich',
        'ISO3166-2-lvl4': 'AT-3',
        postcode: '2700',
        country: 'Österreich',
        country_code: 'at',
    },
    boundingbox: ['47.8120872', '47.8121872', '16.2455567', '16.2456567'],
};

describe('reverseGeocode', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockReset();
    });

    it('should return parsed address info from nominatim response', async () => {
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
