declare const _default: {
    addLocation: typeof addLocation;
    getLatestLocation: typeof getLatestLocation;
    updateLocation: typeof updateLocation;
};
export default _default;
declare function addLocation(account_id: string, latitude: number, longitude: number): Promise<any>;
declare function updateLocation(account_id: string, latitude: number, longitude: number): Promise<any>;
declare function getLatestLocation(account_id: string): Promise<any>;
