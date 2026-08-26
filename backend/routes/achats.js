const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Liste de tous les achats
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT achats.*, fournisseurs.nom as fournisseur_nom, articles.designation as article_nom
            FROM achats
            JOIN fournisseurs ON achats.fournisseur_id = fournisseurs.id
            JOIN articles ON achats.article_id = articles.id
            ORDER BY achats.id DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

// POST : Enregistrer un achat (et AUGMENTER le stock !)
router.post('/', async (req, res) => {
    const { fournisseur_id, article_id, quantite, prix_achat } = req.body;
    try {
        await pool.query('BEGIN'); // Début de la transaction
        
        // 1. Insérer l'achat
        const achatResult = await pool.query(
            'INSERT INTO achats (fournisseur_id, article_id, quantite, prix_achat) VALUES ($1, $2, $3, $4) RETURNING *',
            [fournisseur_id, article_id, quantite, prix_achat]
        );

        // 2. Mettre à jour le stock de l'article (on AJOUTE la quantité)
        await pool.query(
            'UPDATE articles SET quantite_disponible = quantite_disponible + $1 WHERE id = $2',
            [quantite, article_id]
        );

        await pool.query('COMMIT'); // Valider la transaction
        res.json(achatResult.rows[0]);

    } catch (err) {
        await pool.query('ROLLBACK'); // Annuler en cas d'erreur
        res.status(500).send(err.message);
    }
});

module.exports = router;