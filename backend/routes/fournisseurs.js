const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET, POST, PUT, DELETE (même structure que clients.js, mais pour la table fournisseurs)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fournisseurs ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/', async (req, res) => {
    try {
        const { nom, historique_approvisionnement } = req.body;
        const result = await pool.query('INSERT INTO fournisseurs (nom, historique_approvisionnement) VALUES ($1, $2) RETURNING *', [nom, historique_approvisionnement || '']);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send(err.message); }
});

// (Ajoutez PUT et DELETE si besoin, sur le même modèle que clients.js)

module.exports = router;