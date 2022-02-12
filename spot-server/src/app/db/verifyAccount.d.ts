export { addVerifyAccount, getByToken };
declare function addVerifyAccount(accountId: string, token: string): Promise<any>;
declare function getByToken(accountId: string, token: string): Promise<any>;
