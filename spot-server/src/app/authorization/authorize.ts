
const checkRole = ( roles: [] ) => (req: any, res: any, next: any) => {

    if (!req.user) {
        return res.status(400).send('not authorized');
    }

    const hasRole = roles.find(role => req.user.role === role)
    if (!hasRole) {
        return res.status(400).send('not authorized');
    }

    return next();

}

export { checkRole }
