declare const checkRoleMiddleware: (roles: []) => (req: any, res: any, next: any) => any;
declare function checkRole(user: any, roles: []): undefined;
export { checkRoleMiddleware, checkRole };
