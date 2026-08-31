const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Lister les articles avec leur quantité théorique pour faire le comptage
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, designation, quantite_disponible, prix_achat FROM articles ORDER BY designation ASC'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST : Valider l'inventaire et ajuster le stock
router.post('/validate', async (req, res) => {
    const { articles, utilisateur_id } = req.body; // articles: [{ article_id, quantite_comptee }]
    try {
        await pool.query('BEGIN'); // Début de la transaction

        // 1. Créer la session d'inventaire
        const invResult = await pool.query(
            'INSERT INTO inventaires (utilisateur_id, statut) VALUES ($1, $2) RETURNING id',
            [utilisateur_id, 'Validé']
        );
        const inventaireId = invResult.rows[0].id;

        // 2. Boucler sur chaque article compté
        for (const item of articles) {
            const { article_id, quantite_comptee } = item;

            // Récupérer la quantité théorique actuelle
            const artRes = await pool.query('SELECT quantite_disponible FROM articles WHERE id = $1', [article_id]);
            const quantite_theorique = artRes.rows[0].quantite_disponible;

            // Calculer l'écart
            const ecart = quantite_comptee - quantite_theorique;

            // Si écart, on met à jour le stock et on journalise le mouvement
            if (ecart !== 0) {
                await pool.query(
                    'UPDATE articles SET quantite_disponible = $1 WHERE id = $2',
                    [quantite_comptee, article_id]
                );

                await pool.query(
                    'INSERT INTO mouvements_stock (article_id, type_mouvement, quantite, utilisateur_id, commentaire) VALUES ($1, $2, $3, $4, $5)',
                    [article_id, 'Ajustement', ecart, utilisateur_id, `Inventaire #${inventaireId}`]
                );
            }
        }

        await pool.query('COMMIT'); // Valider la transaction
        res.json({ message: 'Inventaire validé avec succès !', inventaire_id: inventaireId });
    } catch (err) {
        await pool.query('ROLLBACK'); // Annuler si erreur
        res.status(500).send(err.message);
    }
});

module.exports = router;