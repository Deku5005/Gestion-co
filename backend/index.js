const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuration CORS (IMPORTANT : Remplacez par l'URL exacte de votre projet Frontend sur Vercel !)
const allowedOrigins = [
  'https://gestion-co-77uo.vercel.app', // ⚠️ Remplacez ceci par votre vrai lien Frontend Vercel
  'http://localhost:5173',              // Pour le développement local
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Autorise les requêtes sans "Origin" (comme Postman) ou depuis les origines autorisées
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Gestion explicite des requêtes de pré-vol (Préflight) pour Vercel
app.options('*', cors());

// Middleware pour lire le JSON
app.use(express.json());

// --- IMPORTATION DES ROUTES ---
const articlesRoutes = require('./routes/articles');
const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const fournisseursRoutes = require('./routes/fournisseurs');
const ventesRoutes = require('./routes/ventes');
const depensesRoutes = require('./routes/depenses');
const achatsRoutes = require('./routes/achats');
const bilanRoutes = require('./routes/bilan');

// --- UTILISATION DES ROUTES ---
app.use('/api/articles', articlesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/ventes', ventesRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/achats', achatsRoutes);
app.use('/api/bilan', bilanRoutes);

// Route de test (optionnelle)
app.get('/', (req, res) => {
    res.send('Le serveur backend fonctionne !');
});

// --- IMPORTANT POUR VERCEL ---
// On n'écoute PAS le port, on exporte l'application pour que Vercel la gère.
module.exports = app;