declare const _default: {
    addVerifyAccount: typeof addVerifyAccount;
    getByToken: typeof getByToken;
};
export default _default;
declare function addVerifyAccount(accountId: string, token: string): Promise<any>;
declare function getByToken(accountId: string, token: string): Promise<any>;
