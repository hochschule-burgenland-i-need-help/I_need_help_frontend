import { reverseGeocode } from './nominatim/nominatim_api';
import { OverpassElement } from './osm/overpass_element';

export interface LocationInfo {
    id: number;
    name: string;
    lat: number;
    lon: number;
    address: string;
    street?: string;
    house?: string;
    postcode?: string;
    city?: string;
    phone?: string;
    website?: string;
    distance?: number;
}

export async function toLocationInfo(e: OverpassElement): Promise<LocationInfo | null> {
    const { id, lat, lon, tags, distance } = e;

    const name = tags.name ?? tags['addr:housename'] ?? 'Unbenannt';
    let street;
    let house;
    let postcode;
    let city;

    if (tags['addr:street']) {
        street = tags['addr:street'] ?? '';
        house = tags['addr:housenumber'] ?? '';
        postcode = tags['addr:postcode'] ?? '';
        city = tags['addr:city'] ?? '';
    } else {
        const addressInfo = await reverseGeocode(lat, lon);
        street = addressInfo?.street ?? '';
        house = addressInfo?.house ?? '';
        city = addressInfo?.city ?? '';
        postcode = addressInfo?.postcode ?? '';
    }

    return {
        id,
        name,
        lat,
        lon,
        address: `${street} ${house}, ${postcode} ${city}`,
        street: street,
        house: house,
        postcode: postcode,
        city: city,
        phone: tags.phone,
        website: tags.website,
        distance: distance,
    };
}
