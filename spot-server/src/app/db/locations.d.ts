export { addLocation, getLatestLocation, updateLocation };
declare function addLocation(account_id: string, latitude: string, longitude: string): Promise<any>;
declare function updateLocation(account_id: string, latitude: string, longitude: string): Promise<any>;
declare function getLatestLocation(account_id: string): Promise<any>;
