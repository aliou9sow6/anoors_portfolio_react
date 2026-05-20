const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Disable Express version disclosure
app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
