# 📚 Portfolio Backend - React + Express + MongoDB

## 🚀 Architecture

```
Frontend React          Express Server         MongoDB Atlas
[React App]  --------> [Node.js API]  ------>  [Cluster Cloud]
Port 3000             Port 5000              Cloud Database
```

## 📋 Prérequis

- Node.js v14+ installé
- MongoDB Atlas (ou MongoDB local) configuré
- React frontend en cours d'exécution

## 🔧 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement (.env)
MONGODB_URI=mongodb://...
PORT=5000
NODE_ENV=development
```

## 🎯 Commandes disponibles

```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement (avec rechargement automatique)
npm run dev

# Importer les données de db.json dans MongoDB
npm run seed

# Importer en écrasant les données existantes
npm run seed:force
```

## 🔌 API Endpoints

### Récupérer tous les projets
```bash
GET http://localhost:5000/api/projets
```
**Réponse:**
```json
[
  {
    "_id": "...",
    "libelle": "Application E-commerce",
    "description": "...",
    "image": "...",
    "technologies": ["React", "Node.js", "MongoDB"],
    "dateCreation": "2024-01-15T00:00:00.000Z",
    "lien": "https://github.com/...",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

### Récupérer un projet par ID
```bash
GET http://localhost:5000/api/projets/:id
```

### Créer un projet
```bash
POST http://localhost:5000/api/projets
Content-Type: application/json

{
  "libelle": "Mon Projet",
  "description": "Description détaillée",
  "image": "url-ou-base64",
  "technologies": ["React", "Node.js"],
  "lien": "https://github.com/...",
  "dateCreation": "2024-01-15"
}
```

### Modifier un projet
```bash
PUT http://localhost:5000/api/projets/:id
Content-Type: application/json

{
  "libelle": "Titre modifié",
  "description": "Nouvelle description",
  "technologies": ["React", "Express"]
}
```

### Supprimer un projet
```bash
DELETE http://localhost:5000/api/projets/:id
```

### Tester le backend
```bash
GET http://localhost:5000/api/test
```

## 📁 Structure du projet

```
backend/
├── models/
│   └── Projet.js              # Schéma MongoDB
├── routes/
│   └── projets.js             # Routes API
├── server.js                  # Configuration Express
├── index.js                   # Point d'entrée
├── seed.js                    # Script d'import de données
├── package.json
├── .env                       # Variables d'environnement
└── README.md                  # Cette documentation
```

## 🔐 Sécurité

- CORS configuré pour accepter les requêtes du frontend
- Validation des données en entrée
- Gestion des erreurs robuste

## 📊 Modèle de données (Projet)

```javascript
{
  _id: ObjectId,
  libelle: String,              // Titre du projet
  image: String,                // URL ou base64
  description: String,          // Description complète
  technologies: [String],       // Liste des technologies
  dateCreation: Date,           // Date de création
  lien: String,                 // Lien GitHub/Portfolio
  createdAt: Date,              // Créé automatiquement
  updatedAt: Date               // Modifié automatiquement
}
```

## 🐛 Dépannage

### Erreur : `Cannot connect to MongoDB`
- Vérifier la variable `MONGODB_URI` dans `.env`
- Vérifier que MongoDB Atlas est accessible
- Vérifier les identifiants et IP whitelist

### Erreur : `CORS error`
- CORS est configuré pour accepter toutes les origines
- Vérifier que le frontend envoie à `http://localhost:5000`

### Port 5000 déjà utilisé
```bash
# Changer le port dans .env
PORT=5001
```

## 🔗 Integration avec React

Le frontend utilise déjà les bons endpoints dans [src/services/api.js](../src/services/api.js):
```javascript
const API_URL = 'http://localhost:5000/api/projets';
```

Les composants React appellent automatiquement:
- `getProjets()` - Afficher tous les projets
- `getProjet(id)` - Afficher un projet
- `addProjet(data)` - Créer un projet
- `updateProjet(id, data)` - Modifier un projet
- `deleteProjet(id)` - Supprimer un projet

## 📝 Notes

- Les images peuvent être stockées en base64 ou en URL externe
- Les dates sont sauvegardées au format ISO 8601
- Les modifications sont trackées avec `createdAt` et `updatedAt`

## 🎓 Prochaines étapes

- [ ] Ajouter l'authentification (JWT)
- [ ] Implémenter des filtres/recherche
- [ ] Ajouter des tests (Jest)
- [ ] Déployer sur Heroku/Railway
- [ ] Ajouter la pagination

---

**Backend prêt à l'emploi !** 🚀
