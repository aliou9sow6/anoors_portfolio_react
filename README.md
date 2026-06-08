# Full Stack portfolio


* application Web SPA (Single Page Application) de gestion de portfolio avec Reactjs
# Portfolio App — Gestion de Projets

Application Web SPA (Single Page Application) de gestion de portfolio réalisée avec **React JS** et **json-server** comme backend REST factice.

---

## Prérequis

- **Node.js** ≥ 16.x
- **npm** ≥ 8.x

---

## Installation

```bash
# 1. Cloner / décompresser le projet
cd portfolio-app

# 2. Installer les dépendances
npm install

# 3. Installer json-server globalement (optionnel)
npm install -g json-server
```

---

## Lancement

Il faut démarrer **deux terminaux** :

### Terminal 1 — Backend json-server (port 3001)
```bash
npm run server
```
L'API REST sera disponible sur `http://localhost:3001/projets`

### Terminal 2 — Application React (port 3000)
```bash
npm start
```
L'application s'ouvre automatiquement sur `http://localhost:3000`

---

## Structure du projet

```
portfolio-app/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                    # Composant racine, gestion des vues
│   ├── index.js                   # Point d'entrée React
│   ├── components/
│   │   ├── Dossier.jsx            # État global, liste des projets
│   │   ├── Projet.jsx             # Carte d'un projet (libellé + image + supprimer)
│   │   ├── AjouterProjet.jsx      # Formulaire d'ajout
│   │   ├── DetaillerProjet.jsx    # Vue détaillée (Annuler / Éditer)
│   │   └── EditerProjet.jsx       # Formulaire d'édition
│   ├── services/
│   │   └── api.js                 # Fonctions fetch (GET, POST, PUT, DELETE)
│   └── styles/
│       └── App.css                # Design system complet
├── db.json                        # Base de données json-server
├── package.json
└── README.md
```

---

## Fonctionnalités

| Fonctionnalité | Composant | Méthode HTTP |
|---|---|---|
| Lister les projets | `Dossier` | `GET /projets` |
| Rechercher un projet | `Dossier` | (filtrage local) |
| Ajouter un projet | `AjouterProjet` | `POST /projets` |
| Supprimer un projet | `Dossier` + `Projet` | `DELETE /projets/:id` |
| Voir le détail | `DetaillerProjet` | — |
| Éditer un projet | `EditerProjet` | `PUT /projets/:id` |

---

## API REST (json-server)

| Méthode | URL | Action |
|---|---|---|
| GET | `/projets` | Récupérer tous les projets |
| GET | `/projets/:id` | Récupérer un projet |
| POST | `/projets` | Ajouter un projet |
| PUT | `/projets/:id` | Modifier un projet |
| DELETE | `/projets/:id` | Supprimer un projet |

---

## Structure d'un projet (db.json)

```json
{
  "id": "1",
  "libelle": "Nom du projet",
  "image": "https://...",
  "description": "Description complète",
  "technologies": ["React", "Node.js"],
  "dateCreation": "2024-01-15",
  "lien": "https://github.com/..."
}
```
## Integration the jenkins pipeline

## Utilisation de Ngrok