# 📋 GUIDE COMPLET DE DÉPLOIEMENT KUBERNETES

## ✅ Étapes Complétées

### 1️⃣ Images Docker Construites
✓ **Frontend**: `portfolio-frontend:v1` (99.7MB)
✓ **Backend**: `portfolio-backend:v1` (272MB)

Vérification:
```bash
docker images | Select-String portfolio
# Output:
# portfolio-backend:v1     d32a76665b1a    272MB
# portfolio-frontend:v1    edce17e60ae5    99.7MB
```

### 2️⃣ Docker Compose - Déploiement Validé ✅
```bash
# Actuellement en cours d'exécution:
# - Frontend: http://localhost:3000 ✓ Fonctionnel
# - Backend:  http://localhost:5001/api ✓ Fonctionnel
# - MongoDB:  mongodb://admin:password123@localhost:27017 ✓ Running
# - Jenkins:  http://localhost:8080 ✓ Running
# - SonarQube: http://localhost:9000 ✓ Running
```

Accès rapide:
```bash
# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter
docker-compose down

# Redémarrer
docker-compose up -d
```

### 3️⃣ Manifests Kubernetes Préparés ✅

**Fichiers prêts** (avec images locales):
- ✓ `k8s/namespace.yaml` - Crée namespace `portfolio`
- ✓ `k8s/backend-deployment.yaml` - 2 replicas, port 5000
- ✓ `k8s/backend-service.yaml` - Service ClusterIP
- ✓ `k8s/frontend-deployment.yaml` - 2 replicas, port 80
- ✓ `k8s/frontend-service.yaml` - Service NodePort

---

## 🚀 DÉPLOIEMENT SUR KUBERNETES - Instructions

### Prérequis

```powershell
# 1. Installer Kubernetes Localement - OPTION A: Docker Desktop

# Étapes:
# 1. Ouvrir Docker Desktop
# 2. Aller dans Settings → Kubernetes
# 3. Activer "Enable Kubernetes"
# 4. Attendre que statut passe à "Kubernetes is running"
# 5. Vérifier:
kubectl cluster-info
kubectl get nodes

# OPTION B: Minikube (non recommandé)
# Docker Desktop Kubernetes est recommandé pour ce projet.
# Si Kubernetes est activé dans Docker Desktop, vous n'avez pas besoin de lancer Minikube.
```

### Étapes de Déploiement

#### **Étape 1: Vérifier l'accès à Kubernetes**

```powershell
# S'assurer que kubectl est configuré
kubectl version --client

# Voir les nodes disponibles
kubectl get nodes

# Voir les contextes
kubectl config get-contexts
kubectl config current-context
```

#### **Étape 2: Charger les Images dans Kubernetes**

**Docker Desktop Kubernetes:**
```powershell
# Les images construites localement sont automatiquement disponibles pour le cluster Docker Desktop.
# Aucune commande minikube n'est nécessaire.
```

#### **Étape 3: Créer le Namespace**

```powershell
# Appliquer le manifests namespace
kubectl apply -f k8s/namespace.yaml

# Vérifier
kubectl get namespaces
kubectl get ns
```

#### **Étape 4: Déployer le Backend**

```powershell
# Appliquer les manifests backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Vérifier les pods
kubectl get pods -n portfolio
kubectl get pods -n portfolio -w  # Watch mode

# Voir les services
kubectl get svc -n portfolio

# Voir les deployments
kubectl get deployments -n portfolio
```

#### **Étape 5: Déployer le Frontend**

```powershell
# Appliquer les manifests frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Vérifier
kubectl get pods -n portfolio
kubectl get svc -n portfolio
```

#### **Étape 6: Vérifier le Déploiement Complet**

```powershell
# Voir TOUT
kubectl get all -n portfolio

# Output attendu:
# NAME                               READY   STATUS    RESTARTS   AGE
# pod/portfolio-backend-xxxxx        1/1     Running   0          2m
# pod/portfolio-backend-xxxxx        1/1     Running   0          2m
# pod/portfolio-frontend-xxxxx       1/1     Running   0          1m
# pod/portfolio-frontend-xxxxx       1/1     Running   0          1m
#
# NAME                          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)
# service/portfolio-backend     ClusterIP   10.x.x.x       <none>        5000/TCP
# service/portfolio-frontend    NodePort    10.x.x.x       <none>        80:3xxxx/TCP
#
# NAME                          READY   UP-TO-DATE   AVAILABLE   AGE
# deployment.apps/backend       2/2     2            2           2m
# deployment.apps/frontend      2/2     2            2           1m
```

#### **Étape 7: Accéder à l'Application**

**Option A: Port Forwarding (Recommandé pour test)**

```powershell
# Frontend
kubectl port-forward -n portfolio svc/portfolio-frontend 3000:80
# Puis accédez à http://localhost:3000

# Backend (dans un autre terminal)
kubectl port-forward -n portfolio svc/portfolio-backend 5000:5000
# Puis accédez à http://localhost:5000/api/projets
```

**Option B: NodePort (si accessible)**

```powershell
# Voir le port NodePort assigné
kubectl get svc -n portfolio

# Si service type est NodePort et port est 30xxx:
# Accédez à http://localhost:30xxx
```

#### **Étape 8: Voir les Logs**

```powershell
# Logs d'un pod backend
kubectl logs -f deployment/portfolio-backend -n portfolio

# Logs d'un pod frontend
kubectl logs -f deployment/portfolio-frontend -n portfolio

# Logs avec timestamps
kubectl logs -f deployment/portfolio-backend -n portfolio --timestamps=true

# Logs des 50 dernières lignes
kubectl logs --tail=50 -n portfolio deployment/portfolio-backend
```

#### **Étape 9: Décrire les Ressources**

```powershell
# Détails complets d'un pod
kubectl describe pod portfolio-backend-xxxxx -n portfolio

# Détails d'un deployment
kubectl describe deployment portfolio-backend -n portfolio

# Détails d'un service
kubectl describe service portfolio-backend -n portfolio
```

#### **Étape 10: Monitorer les Ressources**

```powershell
# Voir l'utilisation CPU/RAM des nodes
kubectl top nodes

# Voir l'utilisation CPU/RAM des pods
kubectl top pods -n portfolio

# Voir en temps réel (watch)
kubectl top pods -n portfolio --watch
```

---

## 🔄 Opérations Courantes

### Redéployer une Image

```powershell
# Trigger un redéploiement en forçant le restart
kubectl rollout restart deployment/portfolio-backend -n portfolio
kubectl rollout restart deployment/portfolio-frontend -n portfolio

# Vérifier le status du rollout
kubectl rollout status deployment/portfolio-backend -n portfolio
```

### Scaler le nombre de replicas

```powershell
# Augmenter à 5 replicas
kubectl scale deployment portfolio-backend --replicas=5 -n portfolio

# Vérifier
kubectl get pods -n portfolio
```

### Voir l'Historique des Deployments

```powershell
# Voir l'historique
kubectl rollout history deployment/portfolio-backend -n portfolio

# Voir les détails d'une révision
kubectl rollout history deployment/portfolio-backend -n portfolio --revision=1

# Revenir à la révision précédente
kubectl rollout undo deployment/portfolio-backend -n portfolio
```

### Mettre à jour une Image

```powershell
# Méthode 1: Modifier le deployment et appliquer
kubectl set image deployment/portfolio-backend portfolio-backend=portfolio-backend:v2 -n portfolio

# Méthode 2: Éditer directement
kubectl edit deployment portfolio-backend -n portfolio
# Puis changer `image:` et sauvegarder
```

### Afficher les Événements

```powershell
# Voir les événements du cluster
kubectl get events -n portfolio

# Voir les événements en ordre chronologique
kubectl get events -n portfolio --sort-by='.lastTimestamp'

# Voir les événements spécifiques à un pod
kubectl describe pod portfolio-backend-xxxxx -n portfolio
```

---

## 🧹 Nettoyage

```powershell
# Supprimer le namespace (supprime TOUT dedans)
kubectl delete namespace portfolio

# Ou supprimer les ressources individuellement
kubectl delete -f k8s/backend-deployment.yaml -n portfolio
kubectl delete -f k8s/backend-service.yaml -n portfolio
kubectl delete -f k8s/frontend-deployment.yaml -n portfolio
kubectl delete -f k8s/frontend-service.yaml -n portfolio

# Ou appliquer tout d'un coup
kubectl delete -f k8s/
```

---

## 📊 Configuration Actuelle

### Images Construites
```yaml
Frontend:
  Image: portfolio-frontend:v1
  Size: 99.7MB
  Based on: nginx:alpine
  Build: npm install → npm run build

Backend:
  Image: portfolio-backend:v1
  Size: 272MB
  Based on: node:22-alpine
  Build: npm install → npm start
```

### Resources Kubernetes
```yaml
Backend:
  Replicas: 2
  Port: 5000
  CPU Request: 100m
  CPU Limit: 500m
  Memory Request: 128Mi
  Memory Limit: 512Mi
  Health Checks: GET /projets

Frontend:
  Replicas: 2
  Port: 80
  CPU Request: 50m
  CPU Limit: 250m
  Memory Request: 64Mi
  Memory Limit: 256Mi
  Health Checks: GET /
```

---

## ✅ Checklist de Vérification

```powershell
# 1. Cluster accessible
[ ] kubectl cluster-info

# 2. Namespace créé
[ ] kubectl get namespace portfolio

# 3. Pods en Running
[ ] kubectl get pods -n portfolio

# 4. Services créés
[ ] kubectl get svc -n portfolio

# 5. Frontend accessible
[ ] curl http://localhost:3000 (via port-forward)

# 6. Backend API accessible
[ ] curl http://localhost:5000/api/projets (via port-forward)

# 7. Logs sans erreurs
[ ] kubectl logs deployment/portfolio-backend -n portfolio
[ ] kubectl logs deployment/portfolio-frontend -n portfolio

# 8. Ressources utilisées
[ ] kubectl top pods -n portfolio
```

---

## 🚨 Troubleshooting

### Problème: CrashLoopBackOff

```powershell
# Cause: Application crash au démarrage
# Solution:
kubectl logs deployment/portfolio-backend -n portfolio
# Chercher l'erreur et corriger le deployment
```

### Problème: ImagePullBackOff

```powershell
# Cause: Image non trouvée
# Solution:
# 1. Vérifier que l'image existe localement
docker images | Select-String portfolio

# 2. Si imagePullPolicy: Always, changer à Never
kubectl set env deployment/portfolio-backend imagePullPolicy=Never -n portfolio

# 3. Docker Desktop Kubernetes utilise les images locales automatiquement.
# Aucune commande minikube n'est nécessaire.
```

### Problème: Pods Pending

```powershell
# Cause: Ressources insuffisantes
# Solution:
kubectl describe pod portfolio-backend-xxxxx -n portfolio
# Chercher "insufficient" dans Events

# Augmenter les ressources du cluster ou réduire les demands
```

### Problème: Service inaccessible

```powershell
# Vérifier que le service existe
kubectl get svc -n portfolio

# Tester la connectivité interne
kubectl run -it --rm debug --image=alpine --restart=Never -- ash
# À l'intérieur du pod:
wget -O- http://portfolio-backend:5000/api/projets
```

---

## 📚 Prochaines Étapes

1. **Configurer Ingress** (accès HTTP(S) depuis l'extérieur)
   - Voir `k8s/ingress.yaml`
   - Installer Ingress Controller

2. **Ajouter des ConfigMaps/Secrets**
   - Gérer les variables d'environnement
   - Stocker les credentials MongoDB

3. **Persistent Volumes**
   - Stocker les données MongoDB
   - Voir `k8s/mongodb-pvc.yaml`

4. **Auto-scaling**
   - Configurer HPA (Horizontal Pod Autoscaler)
   - Augmente/réduit replicas automatiquement

5. **CI/CD**
   - Utiliser Jenkins ou GitHub Actions
   - Pipeline: Build → Push → Deploy

---

## 📞 Commandes Rapides

```powershell
# Deployment rapide
kubectl apply -f k8s/

# Port-forward frontend
kubectl port-forward -n portfolio svc/portfolio-frontend 3000:80

# Voir les logs
kubectl logs -f -n portfolio deployment/portfolio-backend

# Restart
kubectl rollout restart deployment/portfolio-backend -n portfolio

# Supprimer tout
kubectl delete namespace portfolio

# Status complet
kubectl get all -n portfolio
```

---

✅ **Statut du Déploiement**: Prêt pour Kubernetes!

Toutes les images sont construites et les manifests sont configurés. 
Suivez simplement les étapes 1-7 ci-dessus pour déployer sur Kubernetes.
