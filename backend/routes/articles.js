const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Récupérer tous les articles (le stock)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// POST : Créer un nouvel article
router.post('/', async (req, res) => {
    try {
        const { designation, prix_achat, prix_vente, quantite_disponible, seuil_alerte, unite } = req.body;
        const result = await pool.query(
            'INSERT INTO articles (designation, prix_achat, prix_vente, quantite_disponible, seuil_alerte, unite) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [designation, prix_achat, prix_vente, quantite_disponible, seuil_alerte, unite]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// PUT : Modifier un article
router.put('/:id', async (req, res) => {
    try {
        const { designation, prix_achat, prix_vente, quantite_disponible, seuil_alerte, unite } = req.body;
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE articles SET designation = $1, prix_achat = $2, prix_vente = $3, quantite_disponible = $4, seuil_alerte = $5, unite = $6 WHERE id = $7 RETURNING *',
            [designation, prix_achat, prix_vente, quantite_disponible, seuil_alerte, unite, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// DELETE : Supprimer un article
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        res.json({ message: 'Article supprimé avec succès' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;