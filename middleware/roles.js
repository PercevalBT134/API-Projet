export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Non authentifié" });
    const role = req.user.role.trim();
    if (!allowedRoles.map(r => r.toLowerCase()).includes(role.toLowerCase())) {
    return res.status(403).json({ error: "Accès interdit pour ce rôle" });
    }
    next();
  };
};