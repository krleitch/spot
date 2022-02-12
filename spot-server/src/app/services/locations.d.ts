declare function verifyLocation(account_id: string, myLatitude: number, myLongitude: number): Promise<boolean | void>;
declare function addDistanceToRows(rows: any[], latitude: number, longitude: number, hideDistance: boolean): any[];
declare function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, unit: string): number;
declare function getGeolocation(latitude: string, longitude: string): Promise<string>;
declare const _default: {
    checkLocation: (req: any, res: any, next: any) => Promise<any>;
    verifyLocation: typeof verifyLocation;
    distanceBetween: typeof distanceBetween;
    getGeolocation: typeof getGeolocation;
    addDistanceToRows: typeof addDistanceToRows;
};
export default _default;
