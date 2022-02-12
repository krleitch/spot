declare function checkRole(user: any, roles: Array<string>): string | undefined;
declare const _default: {
    checkRoleMiddleware: (roles: string[]) => (req: any, res: any, next: any) => any;
    checkRole: typeof checkRole;
};
export default _default;
