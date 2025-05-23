import { findDepartment } from '../find_department';
import { Department } from '../osm/overpass_api';
import * as overpassApi from '../osm/overpass_api';
import * as locationInfoModule from '../location_info';
import { LocationInfo } from '../location_info';

jest.mock('../osm/overpass_api');
jest.mock('../location_info');

describe('findDepartment', () => {
    const mockEntries = [
        { id: 1, lat: 48.2, lon: 16.3, type: 'node', tags: {} },
        { id: 2, lat: 48.3, lon: 16.4, type: 'node', tags: {} },
    ];

    const mockLocations: LocationInfo[] = [
        {
            id: 1,
            name: 'Entry 1',
            lat: 48.2,
            lon: 16.3,
            address: 'A',
            distance: 300,
        },
        {
            id: 2,
            name: 'Entry 2',
            lat: 48.3,
            lon: 16.4,
            address: 'B',
            distance: 100,
        },
    ];

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return sorted LocationInfo array when entries found', async () => {
        (overpassApi.findNearestDepartment as jest.Mock).mockResolvedValue(mockEntries);
        (locationInfoModule.toLocationInfo as jest.Mock).mockResolvedValueOnce(mockLocations[0]).mockResolvedValueOnce(mockLocations[1]);

        const result = await findDepartment(48.2, 16.3, Department.Police);

        expect(overpassApi.findNearestDepartment).toHaveBeenCalled();
        expect(locationInfoModule.toLocationInfo).toHaveBeenCalledTimes(2);
        expect(result).toHaveLength(2);
        expect(result?.[0].id).toBe(2);
        expect(result?.[1].id).toBe(1);
    });

    it('should return null if no entries are found', async () => {
        (overpassApi.findNearestDepartment as jest.Mock).mockResolvedValue(null);

        const result = await findDepartment(0, 0, Department.Fire);

        expect(result).toBeNull();
    });

    it('should skip null LocationInfo entries', async () => {
        (overpassApi.findNearestDepartment as jest.Mock).mockResolvedValue(mockEntries);
        (locationInfoModule.toLocationInfo as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(mockLocations[1]);

        const result = await findDepartment(48.2, 16.3, Department.Ambulance);

        expect(result).toHaveLength(1);
        expect(result?.[0].id).toBe(2);
    });

    it('should handle undefined distances safely', async () => {
        const withUndefined: LocationInfo[] = [
            { ...mockLocations[0], distance: undefined },
            { ...mockLocations[1], distance: 200 },
        ];

        (overpassApi.findNearestDepartment as jest.Mock).mockResolvedValue(mockEntries);
        (locationInfoModule.toLocationInfo as jest.Mock).mockResolvedValueOnce(withUndefined[0]).mockResolvedValueOnce(withUndefined[1]);

        const result = await findDepartment(48.2, 16.3, Department.Police);

        expect(result?.[0].id).toBe(2);
        expect(result?.[1].id).toBe(1);
    });
});
