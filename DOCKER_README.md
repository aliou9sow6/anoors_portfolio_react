# 🚀 Portfolio React + Express + MongoDB - Docker

Stack complète containerisée pour déploiement simple et rapide.

## 🏗️ Architecture

```
Internet
    │
    ├── Frontend (React) - Port 3000
    │   └── Nginx (production) / Dev Server (développement)
    │
    ├── Backend (Express) - Port 5000
    │   └── API REST + MongoDB
    │
    └── Base de données (MongoDB) - Port 27017
        └── Données persistantes
```

## 📋 Prérequis

- **Docker** installé ([téléchargement](https://docker.com/get-started))
- **Docker Compose** installé
- **Git** (optionnel)

## 🚀 Déploiement Rapide

### 1. Cloner/Configurer

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables si nécessaire
nano .env
```

### 2. Mode Production (Recommandé)

```bash
# Construction et démarrage de tous les services
docker-compose up --build -d

# Vérifier que tout fonctionne
docker-compose ps
curl http://localhost:3000  # Frontend
curl http://localhost:5000/api/test  # Backend
```

### 3. Mode Développement

```bash
# Démarrage en mode développement avec hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

# Les changements dans le code seront automatiquement rechargés
```

## 📊 Commandes Utiles

```bash
# 📈 Voir les logs
docker-compose logs -f

# 🔄 Redémarrer un service
docker-compose restart backend

# 🛑 Arrêter tout
docker-compose down

# 🧹 Nettoyer (supprimer volumes)
docker-compose down -v

# 📊 Voir l'utilisation des ressources
docker stats

# 🔍 Inspecter un conteneur
docker exec -it portfolio_backend sh
```

## 🔧 Configuration

### Variables d'environnement (.env)

```bash
# Base de données
MONGODB_URI=mongodb://admin:password123@mongodb:27017/portfolio_db?authSource=admin

# Backend
PORT=5000
NODE_ENV=production

# Frontend (pour les builds)
REACT_APP_API_URL=http://localhost:5000/api
```

### Personnalisation des ports

Modifier `docker-compose.yml` :
```yaml
ports:
  - "8080:80"    # Frontend sur port 8080
  - "4000:5000"  # Backend sur port 4000
  - "27018:27017" # MongoDB sur port 27018
```

## 🗄️ Gestion de la Base de Données

### Accès direct à MongoDB

```bash
# Se connecter à MongoDB depuis l'extérieur
mongosh "mongodb://admin:password123@localhost:27017/portfolio_db"

# Ou depuis un conteneur
docker exec -it portfolio_mongodb mongosh
```

### Sauvegarde/Restauration

```bash
# Sauvegarde
docker exec portfolio_mongodb mongodump --db portfolio_db --out /backup

# Restauration
docker exec -i portfolio_mongodb mongorestore --db portfolio_db /backup/portfolio_db
```

## 🔒 Sécurité

### En production

1. **Changer les mots de passe** dans `.env`
2. **Utiliser des secrets Docker** au lieu de variables d'environnement
3. **Configurer HTTPS** avec un reverse proxy (Traefik/Nginx)
4. **Limiter l'accès réseau** entre conteneurs

### Secrets Docker (recommandé)

```bash
# Créer des secrets
echo "mon_mot_de_passe_super_securise" | docker secret create mongodb_password -

# Utiliser dans docker-compose.yml
secrets:
  - mongodb_password
```

## 📈 Monitoring & Logs

### Logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend

# Dernières 100 lignes
docker-compose logs --tail=100 frontend
```

### Métriques

```bash
# Utilisation CPU/Mémoire
docker stats

# Informations détaillées
docker inspect portfolio_backend
```

## 🚀 Déploiement Cloud

### Heroku

```bash
# Installer Heroku CLI
npm install -g heroku

# Login et créer l'app
heroku login
heroku create mon-portfolio

# Déployer
heroku container:push web
heroku container:release web
```

### Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login et déployer
railway login
railway deploy
```

### Vercel + MongoDB Atlas

```bash
# Frontend sur Vercel
vercel --prod

# Backend sur Vercel Functions
# MongoDB hébergé sur Atlas
```

## 🐛 Dépannage

### Problèmes courants

**Port déjà utilisé**
```bash
# Voir quels ports sont utilisés
netstat -tulpn | grep :3000

# Changer le port dans docker-compose.yml
ports:
  - "3001:80"
```

**Erreur de build**
```bash
# Nettoyer le cache Docker
docker system prune -a

# Rebuilder
docker-compose build --no-cache
```

**Base de données inaccessible**
```bash
# Vérifier que MongoDB est démarré
docker-compose ps mongodb

# Voir les logs MongoDB
docker-compose logs mongodb
```

**Mémoire insuffisante**
```bash
# Augmenter la mémoire Docker (Docker Desktop > Settings > Resources)
# Ou utiliser des images plus légères
```

## 📚 Structure des fichiers

```
portfolio/
├── docker-compose.yml          # Orchestration production
├── docker-compose.dev.yml      # Configuration développement
├── Dockerfile                  # Frontend production
├── Dockerfile.dev             # Frontend développement
├── nginx.conf                 # Configuration Nginx
├── deploy.sh                  # Script de déploiement
├── .env.example              # Variables d'environnement
├── .dockerignore             # Fichiers exclus du build
├── backend/
│   ├── Dockerfile            # Backend production
│   ├── Dockerfile.dev        # Backend développement
│   ├── .dockerignore         # Fichiers exclus
│   └── ...                   # Code backend
└── src/                      # Code frontend
```

## 🎯 Optimisations

### Performance

- **Multi-stage builds** pour des images légères
- **Cache des dépendances** Node.js
- **Compression gzip** activée
- **CDN** pour les ressources statiques

### Sécurité

- **Utilisateurs non-root** dans les conteneurs
- **Images de base à jour** et sécurisées
- **Secrets** pour les mots de passe
- **Network isolation** entre services

---

## 🎉 Prêt à déployer !

Votre stack est maintenant entièrement containerisée et prête pour le déploiement en un clic !

**🚀 Démarrage rapide :**
```bash
docker-compose up --build -d
```

**📱 Accès :**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

**🛑 Arrêt :**
```bash
docker-compose down
```

Bon déploiement ! 🎊