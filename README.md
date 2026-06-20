# Anoors Portfolio — Full Stack DevOps

Application web Full Stack de gestion de portfolio, conteneurisée et déployée via un pipeline CI/CD complet.

**Stack** : React 19 · Node.js/Express 5 · MongoDB · Docker · Jenkins · SonarQube · Kubernetes · Terraform · AWS

---

## Architecture

```
[Browser]
    │
[Nginx :80] ──── React SPA (build statique)
    │ /api/*
[Express :5000] ──── MongoDB
```

### Infrastructure

| Scénario | Description | Coût |
|---|---|---|
| **Local** | Docker Compose sur la machine | Gratuit |
| **Kubernetes (Docker Desktop)** | kind, 2 nodes | Gratuit |
| **AWS Free Tier** | EC2 t2.micro + Docker Compose | ~$0 (12 mois) |

---

## Démarrage rapide

### Prérequis

- Docker Desktop (avec Kubernetes activé pour le déploiement K8s)
- Node.js ≥ 18
- AWS CLI + Terraform ≥ 1.6 (pour le déploiement cloud)

### Développement local

```bash
# Cloner le projet
git clone https://github.com/aliou9sow6/anoors_portfolio_react.git
cd anoors_portfolio_react

# Copier et remplir les variables d'environnement
cp .env.example .env

# Démarrer frontend + backend + MongoDB
docker-compose up -d

# Frontend : http://localhost:80
# Backend  : http://localhost:5000
```

### Sans Docker

```bash
npm install
# Terminal 1 — Backend
cd backend && npm install && npm start
# Terminal 2 — Frontend
npm start  # http://localhost:3000
```

---

## Pipeline CI/CD (Jenkins)

### Flux

```
GitHub Push
    │
    ▼
Checkout → SonarQube → Quality Gate
    │
    ▼
Build Docker Images (parallel)
    │
    ▼
Push to Docker Hub
    │
    ├── [kubernetes]  Terraform Init & Validate
    │                 Terraform Plan
    │                 Terraform Apply (approbation manuelle)
    │                 Deploy to Kubernetes
    │
    └── [docker-compose]  Deploy with Docker Compose
```

### Paramètres du pipeline

| Paramètre | Valeurs | Description |
|---|---|---|
| `DEPLOY_TARGET` | `kubernetes` / `docker-compose` | Cible de déploiement |
| `K8S_NAMESPACE` | `portfolio` | Namespace Kubernetes |
| `MONGO_PASSWORD` | (secret) | Mot de passe MongoDB pour Terraform |

### Credentials Jenkins requis

| ID | Type | Usage |
|---|---|---|
| `dockerhub-creds` | Username/Password | Push vers Docker Hub |
| `github-creds` | Username/Password ou SSH | Checkout GitHub |
| `aws-credentials` | AWS Credentials | Terraform (déploiement AWS) |
| `kubeconfig` | Secret file | Déploiement Kubernetes |

---

## Infrastructure Terraform (Scénario AWS Free Tier)

```
terraform/scenario1-free-tier/
├── provider.tf          # Provider AWS + TLS + Local
├── variables.tf         # Variables typées avec validations
├── terraform.tfvars.example  # Template (copier → terraform.tfvars)
├── main.tf              # VPC, EC2, SG, EIP, clé SSH
├── outputs.tf           # IP publique, URLs, commande SSH
├── backend.tf           # S3 + DynamoDB pour le remote state
└── scripts/
    └── user_data.sh     # Init EC2 : Docker + Docker Compose + app
```

### Déploiement manuel

```bash
cd terraform/scenario1-free-tier

# Copier et personnaliser les variables
cp terraform.tfvars.example terraform.tfvars
# Éditer : mot de passe MongoDB, IP SSH autorisée, nom de clé

terraform init
terraform plan  -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars

# Outputs après apply :
# elastic_ip   = "54.x.x.x"
# frontend_url = "http://54.x.x.x"
# ssh_command  = "ssh -i portfolio-keypair.pem ubuntu@54.x.x.x"

# Détruire (stop facturation)
terraform destroy -var-file=terraform.tfvars
```

### Estimation des coûts

| Ressource | Free Tier (12 mois) | Après |
|---|---|---|
| EC2 t2.micro | 750h/mois | ~$8.50/mois |
| EBS 20 Go | 30 Go/mois | ~$2/mois |
| Elastic IP | Gratuit si attachée | ~$3.60/mois |
| **Total** | **~$0** | **~$14/mois** |

---

## Kubernetes (Docker Desktop)

```bash
# Appliquer les manifests
kubectl apply -f k8s/

# Vérifier
kubectl get pods -n portfolio
kubectl get svc  -n portfolio
```

### Manifests

```
k8s/
├── namespace.yaml
├── backend-deployment.yaml   # 2 replicas, liveness/readiness probes
├── backend-service.yaml      # ClusterIP :5000
├── frontend-deployment.yaml  # 2 replicas
├── frontend-service.yaml     # LoadBalancer :3000
└── ingress.yaml              # / → frontend, /api → backend
```

---

## Structure du projet

```
anoors_portfolio_react/
├── src/                    # Frontend React
│   ├── components/         # Accueil, Dossier, Projet, CRUD...
│   ├── services/api.js     # Appels Axios vers le backend
│   └── utils/imageUtils.js
├── backend/                # API Node.js/Express
│   ├── server.js
│   ├── models/Projet.js    # Schéma Mongoose
│   └── routes/projets.js   # Routes CRUD
├── terraform/
│   ├── scenario1-free-tier/ # Infrastructure AWS Free Tier
│   └── scenario2-eks/       # Architecture EKS avancée
├── k8s/                    # Manifests Kubernetes
├── Jenkinsfile             # Pipeline CI/CD
├── Dockerfile              # Build frontend (multi-stage)
├── backend/Dockerfile      # Build backend
├── docker-compose.yml      # Stack locale complète
└── nginx.conf              # Config Nginx pour le frontend
```

---

## API Backend

| Méthode | Endpoint | Action |
|---|---|---|
| GET | `/projets` | Lister tous les projets |
| GET | `/projets/:id` | Détail d'un projet |
| POST | `/projets` | Créer un projet |
| PUT | `/projets/:id` | Modifier un projet |
| DELETE | `/projets/:id` | Supprimer un projet |

---

## Versions

| Composant | Version |
|---|---|
| React | 19.x |
| Node.js | 22 Alpine |
| Express | 5.x |
| MongoDB | 6.0 |
| Terraform | 1.6.6 |
| Kubernetes | 1.34.x (Docker Desktop) |
| Jenkins | LTS |
