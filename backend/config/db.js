const { Pool } = require('pg');
require('dotenv').config();

// On récupère l'URL depuis le fichier .env
let connectionString = process.env.DATABASE_URL;

// On retire le paramètre '?sslmode=require' de l'URL, car il force une vérification stricte
// et entre en conflit avec notre 'rejectUnauthorized: false'
connectionString = connectionString.replace('?sslmode=require', '').replace('&sslmode=require', '');

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;