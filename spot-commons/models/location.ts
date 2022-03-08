export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface LoadLocationRequest {}
export interface SetLocationRequest {
    location: LocationData
}

export interface LocationFailure {
    error: string;
}