import { LocationInfo, toLocationInfo } from './location_info';
import { Department, findNearestDepartment } from './osm/overpass_api';

export async function findDepartment(
    latitude: number,
    longitude: number,
    department: Department,
    maxRadius: number = 20000,
    step: number = 2000
): Promise<LocationInfo[] | null> {
    const entries = await findNearestDepartment(latitude, longitude, department, maxRadius, step);

    if (!entries) return null;

    const locationInfos: LocationInfo[] = [];

    for (const entry of entries) {
        const info = await toLocationInfo(entry);
        if (info) {
            locationInfos.push(info);
        }
    }

    locationInfos.sort((a, b) => {
        if (a.distance == null && b.distance == null) return 0;
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
    });

    return locationInfos;
}
