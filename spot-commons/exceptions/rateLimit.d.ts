import { SpotError } from './error';
export declare class RateLimitError extends SpotError {
    constructor(statusCode: number, limit: number, timeout: number);
}
