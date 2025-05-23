export interface OverpassElement {
    id: number;
    lat: number;
    lon: number;
    type: 'node';
    distance?: number;
    tags: {
        name?: string;
        'addr:street'?: string;
        'addr:housenumber'?: string;
        'addr:postcode'?: string;
        'addr:city'?: string;
        'addr:country'?: string;
        'addr:housename'?: string;
        phone?: string;
        fax?: string;
        email?: string;
        website?: string;
        operator?: string;
        amenity?: string;
        emergency?: string;
        [key: string]: string | number | boolean | undefined;
    };
}
