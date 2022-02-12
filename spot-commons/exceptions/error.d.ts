export declare class SpotError extends Error {
    statusCode: string;
    status: string;
    body: any;
    constructor(message: string, statusCode: number);
}
