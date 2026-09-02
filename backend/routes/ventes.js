const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helpers pour bloquer le NaN
const toInt = (val) => { const n = parseInt(val); return isNaN(n) ? null : n; };
const toFloat = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

// GET : Liste de toutes les ventes + Total du jour
router.get('/', async (req, res) => {
    try {
        const ventes = await pool.query('SELECT * FROM ventes ORDER BY id DESC');
        const today = new Date().toLocaleDateString('fr-CA');
        const totalJour = ventes.rows
            .filter(v => new Date(v.date_vente).toLocaleDateString('fr-CA') === today)
            .reduce((sum, v) => sum + parseFloat(v.montant_total), 0);

        res.json({ ventes: ventes.rows, total_jour: totalJour });
    } catch (err) { res.status(500).send(err.message); }
});

// POST : Enregistrer une vente (avec paiement partiel)
router.post('/', async (req, res) => {
    const { article_id, client_id, quantite, prix_vente, mode_paiement, montant_paye, statut_livraison } = req.body;
    try {
        await pool.query('BEGIN');

        // Utilisation des helpers pour éviter le NaN
        const cleanClientId = toInt(client_id);
        const cleanArticleId = toInt(article_id);
        const cleanQuantite = toInt(quantite) || 1;
        const cleanPrixVente = toFloat(prix_vente);
        const cleanMontantPaye = toFloat(montant_paye);

        const montant_total = cleanPrixVente * cleanQuantite;
        const paye = cleanMontantPaye;
        const reste = Math.max(0, montant_total - paye);

        // Vérifier le stock
        const stockCheck = await pool.query('SELECT quantite_disponible FROM articles WHERE id = $1', [cleanArticleId]);
        if (stockCheck.rows.length === 0) throw new Error('Article introuvable');
        if (stockCheck.rows[0].quantite_disponible < cleanQuantite) throw new Error('Stock insuffisant');

        // Décrémenter le stock
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible - $1 WHERE id = $2', [cleanQuantite, cleanArticleId]);

        // Enregistrer la vente
        const result = await pool.query(
            'INSERT INTO ventes (article_id, client_id, date_vente, quantite, prix_vente, montant_total, montant_paye, reste, mode_paiement, statut_livraison) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [cleanArticleId, cleanClientId, cleanQuantite, cleanPrixVente, montant_total, paye, reste, mode_paiement, statut_livraison || 'En attente']
        );

        // Crédit client si reste > 0
        if (reste > 0 && cleanClientId) {
            await pool.query('UPDATE clients SET solde_credit = solde_credit + $1 WHERE id = $2', [reste, cleanClientId]);
        }

        await pool.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(400).send(err.message);
    }
});

// PUT : Modifier une vente
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { article_id, quantite, prix_vente, montant_paye, statut_livraison, client_id } = req.body;
    try {
        await pool.query('BEGIN');

        const cleanClientId = toInt(client_id);
        const cleanArticleId = toInt(article_id);
        const cleanQuantite = toInt(quantite) || 1;
        const cleanPrixVente = toFloat(prix_vente);
        const cleanMontantPaye = toFloat(montant_paye);

        const oldSale = await pool.query('SELECT * FROM ventes WHERE id = $1', [id]);
        if (oldSale.rows.length === 0) throw new Error('Vente introuvable');
        const old = oldSale.rows[0];

        // Remettre l'ancien article en stock
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible + $1 WHERE id = $2', [old.quantite, old.article_id]);

        const montant_total = cleanPrixVente * cleanQuantite;
        const paye = cleanMontantPaye;
        const reste = Math.max(0, montant_total - paye);

        await pool.query(
            'UPDATE ventes SET article_id=$1, client_id=$2, quantite=$3, prix_vente=$4, montant_total=$5, montant_paye=$6, reste=$7, statut_livraison=$8 WHERE id=$9',
            [cleanArticleId, cleanClientId, cleanQuantite, cleanPrixVente, montant_total, paye, reste, statut_livraison, id]
        );

        // Décrémenter le nouveau stock
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible - $1 WHERE id = $2', [cleanQuantite, cleanArticleId]);

        // Mettre à jour le crédit client
        if (old.client_id) {
            await pool.query('UPDATE clients SET solde_credit = solde_credit - $1 WHERE id = $2', [old.reste, old.client_id]);
        }
        if (reste > 0 && cleanClientId) {
            await pool.query('UPDATE clients SET solde_credit = solde_credit + $1 WHERE id = $2', [reste, cleanClientId]);
        }

        await pool.query('COMMIT');
        res.json({ message: 'Vente modifiée avec succès' });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(400).send(err.message);
    }
});

module.exports = router;