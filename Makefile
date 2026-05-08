# Makefile pour le portfolio Docker
.PHONY: help build up down dev prod logs clean reset seed

# Couleurs pour les messages
GREEN := \033[0;32m
BLUE := \033[0;34m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Aide
help: ## Afficher cette aide
	@echo "$(BLUE)🚀 Portfolio Docker - Commandes disponibles$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

# Construction
build: ## Construire toutes les images
	@echo "$(BLUE)🏗️  Construction des images Docker...$(NC)"
	docker-compose build

# Démarrage
up: ## Démarrer tous les services en arrière-plan
	@echo "$(GREEN)🚀 Démarrage des services...$(NC)"
	docker-compose up -d
	@echo "$(YELLOW)⏳ Attente du démarrage...$(NC)"
	@sleep 5
	@make status

down: ## Arrêter tous les services
	@echo "$(RED)🛑 Arrêt des services...$(NC)"
	docker-compose down

# Modes de développement/production
dev: ## Mode développement avec hot-reload
	@echo "$(BLUE)🔧 Mode développement$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
	@echo "$(YELLOW)📝 Hot-reload activé - Les changements seront automatiquement appliqués$(NC)"

prod: ## Mode production optimisé
	@echo "$(GREEN)🏭 Mode production$(NC)"
	docker-compose up --build -d --scale frontend=3
	@echo "$(YELLOW)⚡ Services scalés pour la production$(NC)"

# Monitoring
logs: ## Afficher les logs de tous les services
	docker-compose logs -f

logs-%: ## Afficher les logs d'un service spécifique (ex: make logs-backend)
	docker-compose logs -f $*

status: ## Afficher le statut des services
	@echo "$(BLUE)📊 Statut des services:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(YELLOW)🔗 URLs:$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:5000"
	@echo "  MongoDB:  localhost:27017"

health: ## Vérifier la santé des services
	@echo "$(BLUE)🩺 Vérification de la santé...$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(YELLOW)🌐 Test des endpoints:$(NC)"
	@curl -s http://localhost:5000/api/test > /dev/null && echo "  ✅ Backend OK" || echo "  ❌ Backend KO"
	@curl -s http://localhost:3000 > /dev/null && echo "  ✅ Frontend OK" || echo "  ❌ Frontend KO"

# Base de données
seed: ## Importer les données de test dans MongoDB
	@echo "$(BLUE)🌱 Import des données...$(NC)"
	docker-compose exec backend npm run seed

db-shell: ## Ouvrir un shell MongoDB
	@echo "$(BLUE)🐚 Connexion à MongoDB...$(NC)"
	docker-compose exec mongodb mongosh -u admin -p password123 portfolio_db

db-backup: ## Sauvegarder la base de données
	@echo "$(BLUE)💾 Sauvegarde de la base...$(NC)"
	docker-compose exec mongodb mongodump --db portfolio_db --out /backup
	@echo "$(GREEN)✅ Sauvegarde terminée dans /backup$(NC)"

# Maintenance
clean: ## Nettoyer les conteneurs et images non utilisés
	@echo "$(RED)🧹 Nettoyage Docker...$(NC)"
	docker-compose down -v
	docker system prune -f
	docker image prune -f

reset: ## Reset complet (⚠️ supprime TOUTES les données)
	@echo "$(RED)⚠️  ATTENTION: Cette commande supprime TOUTES les données !$(NC)"
	@read -p "Êtes-vous sûr ? (tapez 'yes' pour confirmer): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(RED)🔥 Reset complet en cours...$(NC)"; \
		docker-compose down -v; \
		docker system prune -a -f; \
		docker volume prune -f; \
		echo "$(GREEN)✅ Reset terminé$(NC)"; \
	else \
		echo "$(YELLOW)❌ Reset annulé$(NC)"; \
	fi

# Développement
install: ## Installer les dépendances locales
	@echo "$(BLUE)📦 Installation des dépendances...$(NC)"
	npm install
	cd backend && npm install

test: ## Lancer les tests
	@echo "$(BLUE)🧪 Lancement des tests...$(NC)"
	docker-compose exec backend npm test
	npm test

# Informations système
info: ## Informations sur l'environnement Docker
	@echo "$(BLUE)🐳 Informations Docker:$(NC)"
	@docker --version
	@echo ""
	@docker-compose --version
	@echo ""
	@echo "$(YELLOW)📊 Utilisation des ressources:$(NC)"
	@docker system df

# Raccourcis
start: up ## Alias pour 'up'
stop: down ## Alias pour 'down'
restart: ## Redémarrer tous les services
	@echo "$(YELLOW)🔄 Redémarrage des services...$(NC)"
	docker-compose restart