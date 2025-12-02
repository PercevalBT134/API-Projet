export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès interdit pour ce rôle" });
    }
    next();
  };
};