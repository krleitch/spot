export interface Account {
    id: number;
    email: string;
    username: string;
    password: string;
    phone: string;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface SetLocationRequest {
    location: Location
}
