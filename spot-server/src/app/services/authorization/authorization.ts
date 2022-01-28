// Middleware used on routes
// TODO these error msgs
const checkRoleMiddleware = (roles: []) => (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(400).send('not authorized');
  }

  const hasRole = roles.find((role) => req.user.role === role);
  if (!hasRole) {
    return res.status(400).send('not authorized');
  }

  return next();
};

// Used within a function given a user
function checkRole(user: any, roles: []) {
  return roles.find((role) => user.role === role);
}

export { checkRoleMiddleware, checkRole };
