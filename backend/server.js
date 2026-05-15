const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ Connecté à MongoDB');
  })
  .catch((error) => {
    console.error('✗ Erreur de connexion MongoDB:', error);
    process.exit(1);
  });

// Routes
app.use('/api/projets', require('./routes/projets'));

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionne correctement' });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = app;
