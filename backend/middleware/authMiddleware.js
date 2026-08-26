const jwt = require('jsonwebtoken');

// Vérifie que l'utilisateur est connecté
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Accès refusé" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

// Vérifie que l'utilisateur a le bon rôle (ex: 'Admin')
const checkRole = (role) => (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ message: "Action non autorisée" });
    next();
};

module.exports = { auth, checkRole };