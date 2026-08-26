const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET : Récupérer les statistiques du bilan
router.get('/', async (req, res) => {
    try {
        // 1. Chiffre d'affaires et nombre de ventes
        const ventes = await pool.query('SELECT COALESCE(SUM(montant_total), 0) as ca, COUNT(*) as nb_ventes FROM ventes');
        
        // 2. Total des dépenses
        const depenses = await pool.query('SELECT COALESCE(SUM(montant), 0) as total_depenses FROM depenses');

        // 3. Nombre de clients
        const clients = await pool.query('SELECT COUNT(*) as nb_clients FROM clients');

        // 4. Valeur du stock (Prix d'achat x Quantité)
        const stock = await pool.query('SELECT COALESCE(SUM(quantite_disponible * prix_achat), 0) as valeur_stock FROM articles');

        // 5. Alertes de stock (Produits sous le seuil d'alerte)
        const alertes = await pool.query('SELECT COUNT(*) as nb_alertes FROM articles WHERE quantite_disponible <= seuil_alerte');

        // On renvoie tout dans un seul objet JSON
        res.json({
            ca: ventes.rows[0].ca,
            nb_ventes: ventes.rows[0].nb_ventes,
            total_depenses: depenses.rows[0].total_depenses,
            nb_clients: clients.rows[0].nb_clients,
            valeur_stock: stock.rows[0].valeur_stock,
            nb_alertes: alertes.rows[0].nb_alertes,
            benefice_net: ventes.rows[0].ca - depenses.rows[0].total_depenses
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur pour le bilan');
    }
});

// GET : Données pour les graphiques (Ventes des 7 derniers jours)
router.get('/charts', async (req, res) => {
    try {
        const ventes7jours = await pool.query(`
            SELECT TO_CHAR(date_vente, 'DD/MM') as jour, SUM(montant_total) as total
            FROM ventes
            WHERE date_vente >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY date_vente
            ORDER BY date_vente ASC
        `);
        res.json(ventes7jours.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;