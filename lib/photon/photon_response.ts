import { PhotonFeature } from './photon_feature';

export interface PhotonResponse {
    type: 'FeatureCollection';
    features: PhotonFeature[];
}
