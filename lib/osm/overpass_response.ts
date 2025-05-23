import { OverpassElement } from './overpass_element';

export interface OverpassResponse {
    elements: OverpassElement[];
}

export function parseOverpassResponse(json: OverpassResponse): OverpassElement[] {
    if (!json || !Array.isArray(json.elements)) return [];

    return json.elements;
}
