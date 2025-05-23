import { findNearestDepartment, Department } from '../overpass_api';
import * as overpassResponse from '../overpass_response';
import * as distanceCalc from '../distance_calculation';

global.fetch = jest.fn();

describe('findNearestDepartment', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockReset();
        jest.spyOn(overpassResponse, 'parseOverpassResponse').mockReset();
        jest.spyOn(distanceCalc, 'getDistancesToLocations').mockReset();
    });

    it('should find a department on first radius attempt with distance calculation', async () => {
        const rawElements = [{ id: 1, lat: 0, lon: 0, type: 'node', tags: {} }];
        const withDistance = [{ ...rawElements[0], distance: 123 }];

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ elements: [{}] }),
        });
        (overpassResponse.parseOverpassResponse as jest.Mock).mockReturnValue(rawElements);
        (distanceCalc.getDistancesToLocations as jest.Mock).mockReturnValue(withDistance);

        const result = await findNearestDepartment(48.2, 16.3, Department.Police);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(result).toEqual(withDistance);
        expect(result?.[0].distance).toBe(123);
    });

    it('should increase radius if nothing found initially', async () => {
        const rawElements = [{ id: 2, lat: 0, lon: 0, type: 'node', tags: {} }];
        const withDistance = [{ ...rawElements[0], distance: 456 }];

        (fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ elements: [] }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ elements: [{}] }),
            });

        (overpassResponse.parseOverpassResponse as jest.Mock).mockReturnValueOnce([]).mockReturnValueOnce(rawElements);

        (distanceCalc.getDistancesToLocations as jest.Mock).mockReturnValueOnce([]).mockReturnValueOnce(withDistance);

        const result = await findNearestDepartment(48.2, 16.3, Department.Fire, 3000, 1000);

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(result?.[0].id).toBe(2);
        expect(result?.[0].distance).toBe(456);
    });

    it('should return null on network error', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failed'));

        const result = await findNearestDepartment(0, 0, Department.Ambulance);
        expect(result).toBeNull();
    });

    it('should stop at max radius and return null if nothing found', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ elements: [] }),
        });

        (overpassResponse.parseOverpassResponse as jest.Mock).mockReturnValue([]);
        (distanceCalc.getDistancesToLocations as jest.Mock).mockReturnValue([]);

        const result = await findNearestDepartment(0, 0, Department.Police, 2000, 1000);

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(result).toBeNull();
    });
});
