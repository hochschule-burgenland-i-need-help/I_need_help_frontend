export interface PhotonFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [lon, lat]
    };
    properties: {
        osm_type: string;
        osm_id: number;
        osm_key: string;
        osm_value: string;
        type: string;
        country: string;
        countrycode: string;
        postcode?: string;
        state?: string;
        city?: string;
        street?: string;
        housenumber?: string;
        district?: string;
        locality?: string;
    };
}
