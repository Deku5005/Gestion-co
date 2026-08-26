const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const run = async () => {
    try {
        console.log("Connexion à Aiven et création des tables en cours...");
        const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(sql);
        console.log("✅ Tables créées avec succès dans la base Aiven !");
        process.exit(0); // Arrête le script une fois terminé
    } catch (err) {
        console.error("❌ Erreur lors de la création des tables :", err);
        process.exit(1);
    }
};

run();