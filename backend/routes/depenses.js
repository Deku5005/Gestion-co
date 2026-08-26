const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET, POST, PUT, DELETE (même structure que clients.js, mais pour la table depenses)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM depenses ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/', async (req, res) => {
    try {
        const { libelle, montant } = req.body;
        const result = await pool.query('INSERT INTO depenses (libelle, montant, date_depense) VALUES ($1, $2, CURRENT_DATE) RETURNING *', [libelle, montant]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;