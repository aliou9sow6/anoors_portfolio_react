const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const promClient = require('prom-client');
require('dotenv').config();

const app = express();

// ─── Prometheus metrics ──────────────────────────────────────
// Collecte automatique des métriques Node.js par défaut
// (CPU, mémoire, event loop, garbage collector...)
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Compteur de requêtes HTTP par méthode, route et status code
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// Histogramme de la durée des requêtes HTTP
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// Jauge de l'état de la connexion MongoDB (1=connecté, 0=déconnecté)
const mongoConnectionGauge = new promClient.Gauge({
  name: 'mongodb_connection_status',
  help: 'Statut de la connexion MongoDB (1=connecté, 0=déconnecté)',
  registers: [register],
});

// Middleware pour mesurer chaque requête
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);
  });
  next();
});

// ─── Disable Express version disclosure ──────────────────────
app.disable('x-powered-by');

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ Connecté à MongoDB');
    mongoConnectionGauge.set(1);
  })
  .catch((error) => {
    console.error('✗ Erreur de connexion MongoDB:', error);
    mongoConnectionGauge.set(0);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => mongoConnectionGauge.set(0));
mongoose.connection.on('reconnected',  () => mongoConnectionGauge.set(1));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/projets', require('./routes/projets'));

// Endpoint métriques Prometheus (scraped par Prometheus toutes les 15s)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Route de santé
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionne correctement' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

module.exports = app;
