import { getDistancesToLocations } from './distance_calculation';
import { OverpassElement } from './overpass_element';
import { parseOverpassResponse } from './overpass_response';

export enum Department {
    Police,
    Fire,
    Ambulance,
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function createQuery(latitude: number, longitude: number, department: Department, radius: number): string {
    let query = '[out:json];(';

    switch (department) {
        case Department.Fire:
            query += `node[amenity=fire_station](around:${radius},${latitude},${longitude});`;
            break;
        case Department.Ambulance:
            query += `node[emergency=ambulance_station](around:${radius},${latitude},${longitude});`;
            query += `node[amenity=hospital](around:${radius},${latitude},${longitude});`;
            break;
        default:
            query += `node[amenity=police](around:${radius},${latitude},${longitude});`;
            break;
    }

    query += ');out body;';

    return query;
}

export async function findNearestDepartment(
    latitude: number,
    longitude: number,
    department: Department,
    maxRadius: number = 20000,
    step: number = 2000
): Promise<OverpassElement[] | null> {
    let radius = step;

    while (radius <= maxRadius) {
        const query = createQuery(latitude, longitude, department, radius);

        try {
            const response = await fetch(OVERPASS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `data=${encodeURIComponent(query)}`,
            });

            const json = await response.json();

            let entries: OverpassElement[] = parseOverpassResponse(json);

            entries = getDistancesToLocations(latitude, longitude, entries);

            if (entries != null && entries.length > 0) {
                return entries;
            }
        } catch (error) {
            console.log('Overpass: ' + error);
            return null;
        }

        radius += step;
    }

    return null;
}
