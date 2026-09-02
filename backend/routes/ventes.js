const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Liste de toutes les ventes + Total du jour
router.get('/', async (req, res) => {
    try {
        const ventes = await pool.query('SELECT * FROM ventes ORDER BY id DESC');
        
        // Calcul du total des ventes du jour (date actuelle)
        const today = new Date().toISOString().split('T')[0];
        const totalJour = ventes.rows
            .filter(v => new Date(v.date_vente).toISOString().split('T')[0] === today)
            .reduce((sum, v) => sum + parseFloat(v.montant_total), 0);

        res.json({ ventes: ventes.rows, total_jour: totalJour });
    } catch (err) { res.status(500).send(err.message); }
});

// POST : Enregistrer une vente (avec paiement partiel et crédit client)
router.post('/', async (req, res) => {
    const { article_id, client_id, quantite, prix_vente, mode_paiement, montant_paye, statut_livraison } = req.body;
    try {
        await pool.query('BEGIN');

        // 1. NETTOYAGE DES DONNÉES (IMPORTANT pour éviter les erreurs PostgreSQL)
        const cleanClientId = client_id === '' || client_id === undefined ? null : parseInt(client_id);
        const cleanArticleId = article_id === '' || article_id === undefined ? null : parseInt(article_id);
        const cleanQuantite = parseInt(quantite) || 0;
        const cleanPrixVente = parseFloat(prix_vente) || 0;
        const cleanMontantPaye = montant_paye ? parseFloat(montant_paye) : 0;

        // Calculs
        const montant_total = cleanPrixVente * cleanQuantite;
        const paye = cleanMontantPaye;
        const reste = Math.max(0, montant_total - paye);

        // 2. Vérifier le stock (en utilisant les valeurs nettoyées)
        const stockCheck = await pool.query('SELECT quantite_disponible FROM articles WHERE id = $1', [cleanArticleId]);
        if (stockCheck.rows.length === 0) throw new Error('Article introuvable');
        if (stockCheck.rows[0].quantite_disponible < cleanQuantite) throw new Error('Stock insuffisant');

        // 3. Décrémenter le stock (en utilisant les valeurs nettoyées)
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible - $1 WHERE id = $2', [cleanQuantite, cleanArticleId]);

        // 4. Enregistrer la vente
        const result = await pool.query(
            'INSERT INTO ventes (article_id, client_id, date_vente, montant_total, montant_paye, reste, mode_paiement, statut_livraison) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7) RETURNING *',
            [cleanArticleId, cleanClientId, montant_total, paye, reste, mode_paiement, statut_livraison || 'En attente']
        );

        // 5. Si reste > 0 et qu'il y a un client : on ajoute la dette au solde du client !
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

// PUT : Modifier une vente (et corriger le stock!)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { article_id, quantite, prix_vente, montant_paye, statut_livraison, client_id } = req.body;
    try {
        await pool.query('BEGIN');

        // NETTOYAGE DES DONNÉES pour la modification
        const cleanClientId = client_id === '' || client_id === undefined ? null : parseInt(client_id);
        const cleanArticleId = article_id === '' || article_id === undefined ? null : parseInt(article_id);
        const cleanQuantite = parseInt(quantite) || 0;
        const cleanPrixVente = parseFloat(prix_vente) || 0;
        const cleanMontantPaye = montant_paye ? parseFloat(montant_paye) : 0;

        // Récupérer l'ancienne vente
        const oldSale = await pool.query('SELECT * FROM ventes WHERE id = $1', [id]);
        if (oldSale.rows.length === 0) throw new Error('Vente introuvable');
        const old = oldSale.rows[0];

        // 1. Remettre l'ancien article en stock
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible + $1 WHERE id = $2', [old.quantite, old.article_id]);

        // 2. Calculer le nouveau total
        const montant_total = cleanPrixVente * cleanQuantite;
        const paye = cleanMontantPaye;
        const reste = Math.max(0, montant_total - paye);

        // 3. Mettre à jour la vente
        await pool.query(
            'UPDATE ventes SET article_id=$1, client_id=$2, quantite=$3, prix_vente=$4, montant_total=$5, montant_paye=$6, reste=$7, statut_livraison=$8 WHERE id=$9',
            [cleanArticleId, cleanClientId, cleanQuantite, cleanPrixVente, montant_total, paye, reste, statut_livraison, id]
        );

        // 4. Décrémenter le nouveau stock
        await pool.query('UPDATE articles SET quantite_disponible = quantite_disponible - $1 WHERE id = $2', [cleanQuantite, cleanArticleId]);

        // 5. Mettre à jour le crédit client si nécessaire (Annuler l'ancien, ajouter le nouveau)
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