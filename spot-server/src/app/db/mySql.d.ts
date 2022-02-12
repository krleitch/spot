import mysql from 'mysql';
export declare function initDb(): void;
export declare function query(sql: string, args: Array<any>): Promise<Array<any>>;
export declare function closeDb(): Promise<unknown>;
export declare function getDb(): mysql.Pool;
