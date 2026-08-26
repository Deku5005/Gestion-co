const clientsRoutes = require('./routes/clients');
const fournisseursRoutes = require('./routes/fournisseurs');
const ventesRoutes = require('./routes/ventes');
const depensesRoutes = require('./routes/depenses');
const bilanRoutes = require('./routes/bilan');
const achatsRoutes = require('./routes/achats');





const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Importation des routes
const articlesRoutes = require('./routes/articles');
const authRoutes = require('./routes/auth'); // <-- Nouvelle ligne

// Utilisation des routes
app.use('/api/articles', articlesRoutes);
app.use('/api/auth', authRoutes); // <-- Nouvelle ligne
app.use('/api/clients', clientsRoutes);
app.use('/api/fournisseurs', fournisseursRoutes);
app.use('/api/ventes', ventesRoutes);
app.use('/api/depenses', depensesRoutes);
app.use('/api/bilan', bilanRoutes);
app.use('/api/achats', achatsRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('Le serveur backend fonctionne !');
});

module.exports = app;