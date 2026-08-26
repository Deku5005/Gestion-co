const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { auth, checkRole } = require('../middleware/authMiddleware');

// Inscription (Création de compte)
router.post('/register', auth, checkRole('Admin'), async (req, res) => {
    try {
        const { nom, email, mot_de_passe, role } = req.body;

        // 1. Vérifier si l'email existe déjà
        const userExist = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // 2. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

        // 3. Insérer l'utilisateur dans la base
        const result = await pool.query(
            'INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING id, nom, email, role',
            [nom, email, hashedPassword, role]
        );

        res.status(201).json({ message: "Utilisateur créé avec succès", utilisateur: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur serveur");
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        // 1. Chercher l'utilisateur
        const result = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        const user = result.rows[0];

        // 2. Vérifier le mot de passe
        const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
        if (!validPassword) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // 3. Générer le Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, utilisateur: { id: user.id, nom: user.nom, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur serveur");
    }
});

// Récupérer ses propres infos (protégé par le token)
router.get('/me', async (req, res) => {
    try {
        // Récupérer le token dans l'en-tête Authorization
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Accès refusé" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await pool.query('SELECT id, nom, email, role, statut FROM utilisateurs WHERE id = $1', [decoded.id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

        res.json(result.rows[0]);
    } catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { nom, email, mot_de_passe } = req.body;
        const userId = req.user.id; // On prend l'ID du token

        // Si le mot de passe est fourni, on le hache, sinon on garde l'ancien
        let hashedPassword;
        if (mot_de_passe) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(mot_de_passe, salt);
        }

        const result = await pool.query(
            'UPDATE utilisateurs SET nom = $1, email = $2, mot_de_passe = COALESCE($3, mot_de_passe) WHERE id = $4 RETURNING id, nom, email, role',
            [nom, email, hashedPassword, userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;