# Kubernetes Deployment

## Prérequis

- Docker Desktop avec Kubernetes activé, ou Minikube
- kubectl configuré
- Images Docker disponibles sur Docker Hub ou localement

## Étapes de déploiement

### 1. Vérifier Kubernetes

```bash
kubectl version --client
kubectl cluster-info
```

### 2. Créer le namespace

```bash
kubectl apply -f namespace.yaml
```

### 3. Déployer le backend

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
```

### 4. Déployer le frontend

```bash
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

### 5. Vérifier les déploiements

```bash
# Voir tous les pods
kubectl get pods -n portfolio

# Voir les services
kubectl get svc -n portfolio

# Voir les déploiements
kubectl get deployments -n portfolio
```

### 6. Accéder à l'application

#### Option A: Port-Forward (local dev)

```bash
# Frontend
kubectl port-forward -n portfolio svc/portfolio-frontend-service 3000:3000

# Backend
kubectl port-forward -n portfolio svc/portfolio-backend-service 5000:5000
```

Puis accédez à:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/projets

#### Option B: Service LoadBalancer (si supporté)

```bash
kubectl get svc -n portfolio
# Obtenez l'IP/port du frontend-service
```

### 7. Monitorer les logs

```bash
# Logs d'un pod
kubectl logs -n portfolio <pod-name>

# Logs en temps réel
kubectl logs -n portfolio -f <pod-name>

# Logs de tous les pods d'un déploiement
kubectl logs -n portfolio -l app=portfolio-backend --tail=50
```

### 8. Déployer l'Ingress (optionnel)

```bash
# Installation de nginx-ingress si nécessaire
kubectl apply -f ingress.yaml
```

## Dépannage

### Les pods ne démarrent pas

```bash
# Inspecter un pod
kubectl describe pod -n portfolio <pod-name>

# Voir les événements du cluster
kubectl get events -n portfolio
```

### Images non trouvées

Vérifier que les images Docker sont disponibles:
```bash
docker images | grep portfolio
```

Si besoin, tagger et pousser les images:
```bash
docker tag portfolio-frontend:latest anoor9s6/portfolio-frontend:latest
docker push anoor9s6/portfolio-frontend:latest
```

### Réinitialiser le déploiement

```bash
# Supprimer tout le namespace
kubectl delete namespace portfolio

# Redéployer
kubectl apply -f namespace.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

## Architecture

```
┌─────────────────────────────────────┐
│     Kubernetes Cluster              │
│                                     │
│  ┌──────────────────────────────┐   │
│  │   portfolio namespace        │   │
│  │                              │   │
│  │  Frontend Pods (2x)          │   │
│  │  ├─ port 80                  │   │
│  │  └─ LoadBalancer SVC :3000   │   │
│  │                              │   │
│  │  Backend Pods (2x)           │   │
│  │  ├─ port 5000                │   │
│  │  └─ ClusterIP SVC :5000      │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```
