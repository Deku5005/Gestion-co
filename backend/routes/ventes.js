const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Liste des ventes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ventes ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err.message); }
});

// POST : Enregistrer une vente (et décrémenter le stock !)
router.post('/', async (req, res) => {
    const client = req.body;
    try {
        // On démarre une transaction pour être sûr que tout se passe bien
        await pool.query('BEGIN');
        
        // 1. Vérifier le stock disponible
        const stockCheck = await pool.query('SELECT quantite_disponible FROM articles WHERE id = $1', [client.article_id]);
        if (stockCheck.rows[0].quantite_disponible < client.quantite) {
            throw new Error('Stock insuffisant');
        }

        // 2. Décrémenter le stock
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible - $1 WHERE id = $2', [client.quantite, client.article_id]);

        // 3. Enregistrer la vente
        const result = await pool.query(
            'INSERT INTO ventes (article_id, client_id, date_vente, montant_total, mode_paiement, statut_livraison) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5) RETURNING *',
            [client.article_id, client.client_id, (client.prix_vente * client.quantite), client.mode_paiement, client.statut_livraison || 'En attente']
        );

        // 4. Valider la transaction
        await pool.query('COMMIT');
        res.json(result.rows[0]);

    } catch (err) {
        await pool.query('ROLLBACK'); // Annuler tout si erreur
        res.status(400).send(err.message);
    }
});
// PUT : Mettre à jour le statut d'une vente (ex: "En attente" -> "Validée" -> "Livrée")
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { statut_livraison } = req.body;
        
        const result = await pool.query(
            'UPDATE ventes SET statut_livraison = $1 WHERE id = $2 RETURNING *',
            [statut_livraison, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;