import jwt from "jsonwebtoken";

export const authenticateRefreshToken = (req, res, next) => {
  // Les tokens sont envoyés dans le header Authorization : Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Récupère juste le token

  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });

    req.user = user; // on met les infos du token dans req.user pour les routes
    next(); // passe au middleware / route suivante
  });
};