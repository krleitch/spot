import mysql from 'mysql';
declare function initDb(): void;
declare function query(sql: string, args: Array<any>): Promise<unknown>;
declare function closeDb(): Promise<unknown>;
declare function getDb(): mysql.Pool;
declare const _default: {
    initDb: typeof initDb;
    closeDb: typeof closeDb;
    getDb: typeof getDb;
    query: typeof query;
};
export default _default;
