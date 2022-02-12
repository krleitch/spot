export { checkLocation, verifyLocation, distanceBetween, getGeolocation, addDistanceToRows };
declare const checkLocation: (req: any, res: any, next: any) => Promise<any>;
declare function verifyLocation(account_id: string, myLatitude: number, myLongitude: number): Promise<boolean>;
declare function addDistanceToRows(rows: any[], latitude: number, longitude: number, hideDistance: boolean): any[];
declare function distanceBetween(lat1: number, lon1: number, lat2: number, lon2: number, unit: string): number;
declare function getGeolocation(latitude: string, longitude: string): Promise<string>;
