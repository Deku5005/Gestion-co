const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Liste des clients
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

// POST : Créer un client
router.post('/', async (req, res) => {
    try {
        const { nom, solde_credit } = req.body;
        const result = await pool.query('INSERT INTO clients (nom, solde_credit) VALUES ($1, $2) RETURNING *', [nom, solde_credit || 0]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send(err.message); }
});

// PUT : Modifier un client (ex: ajouter du crédit)
router.put('/:id', async (req, res) => {
    try {
        const { nom, solde_credit } = req.body;
        const { id } = req.params;
        const result = await pool.query('UPDATE clients SET nom = $1, solde_credit = $2 WHERE id = $3 RETURNING *', [nom, solde_credit, id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send(err.message); }
});

// DELETE : Supprimer un client
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        res.json({ message: 'Client supprimé' });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;