export { addPasswordReset, getByToken };
declare function addPasswordReset(account_id: string, token: string): Promise<any>;
declare function getByToken(token: string): Promise<any>;
