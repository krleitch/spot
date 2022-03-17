export interface LocationData {
  latitude: number;
  longitude: number;
}

// Store
export interface SetLoadingLocation {}
export interface SetLocation {
    location: LocationData
}
export interface SetLocationFailure {
    error: string;
}