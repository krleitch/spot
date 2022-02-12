declare const _default: {
    addPasswordReset: typeof addPasswordReset;
    getByToken: typeof getByToken;
};
export default _default;
declare function addPasswordReset(account_id: string, token: string): Promise<any>;
declare function getByToken(token: string): Promise<any>;
