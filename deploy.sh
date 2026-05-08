#!/bin/bash

# Script de déploiement Docker
# Utilisation: ./deploy.sh [dev|prod]

set -e

ENV=${1:-prod}
PROJECT_NAME="portfolio"

echo "🚀 Déploiement du portfolio en mode $ENV"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Nettoyer les images non utilisées (optionnel)
if [ "$ENV" = "prod" ]; then
    echo "🧹 Nettoyage des images Docker..."
    docker image prune -f
fi

# Builder et démarrer les services
echo "🏗️  Construction et démarrage des services..."
if [ "$ENV" = "dev" ]; then
    # Mode développement avec volumes montés
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
else
    # Mode production
    docker-compose up --build -d
fi

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier la santé des services
echo "🔍 Vérification des services..."
docker-compose ps

# Tester les endpoints
echo "🧪 Test des endpoints..."
curl -s http://localhost:5000/api/test && echo "✅ Backend OK" || echo "❌ Backend KO"
curl -s http://localhost:3000 | grep -q "react" && echo "✅ Frontend OK" || echo "❌ Frontend KO"

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "🗄️  MongoDB:  localhost:27017"
echo ""
echo "📊 Logs: docker-compose logs -f"
echo "🛑 Arrêt: docker-compose down"
