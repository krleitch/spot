export { calcDistance, generateLink, validContent };
declare function generateLink(): Promise<string>;
declare function validContent(content: string): Error | null;
declare function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: string): number;
