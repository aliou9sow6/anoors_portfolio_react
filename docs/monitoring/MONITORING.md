# Stack de Monitoring — Prometheus + Grafana

Documentation complète du système d'observabilité du portfolio Full Stack.

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Composants](#composants)
4. [Installation et démarrage](#installation-et-démarrage)
5. [Métriques exposées](#métriques-exposées)
6. [Prometheus — Guide d'utilisation](#prometheus--guide-dutilisation)
7. [Grafana — Guide d'utilisation](#grafana--guide-dutilisation)
8. [Dashboards](#dashboards)
9. [Alertes](#alertes)
10. [Résolution de problèmes](#résolution-de-problèmes)
11. [Référence des URLs](#référence-des-urls)

---

## Vue d'ensemble

Le stack de monitoring répond à une question fondamentale :

> **L'application fonctionne-t-elle correctement en ce moment ?**

Sans monitoring, tu découvres les pannes quand les utilisateurs se plaignent. Avec ce stack, tu sais en temps réel :
- Combien de requêtes arrivent par seconde
- Quel pourcentage retournent une erreur
- Combien de temps chaque requête prend
- Si MongoDB est connecté
- Combien de mémoire Node.js consomme
- Si le CPU ou la RAM de la machine est surchargé

### Les trois couches d'observabilité

```
┌─────────────────────────────────────────────────┐
│  MÉTRIQUES (Prometheus + Grafana)               │  ← Ce fichier
│  "Que se passe-t-il en chiffres ?"              │
├─────────────────────────────────────────────────┤
│  LOGS (docker-compose logs)                     │
│  "Que s'est-il passé exactement ?"              │
├─────────────────────────────────────────────────┤
│  TRACES (non implémenté)                        │
│  "Quel chemin a suivi cette requête ?"          │
└─────────────────────────────────────────────────┘
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOURCES DE DONNÉES                        │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │ Backend Node.js  │  │   cAdvisor   │  │  Node Exporter    │   │
│  │ :5000/metrics    │  │  :8080/metr. │  │  :9100/metrics    │   │
│  │ (prom-client)    │  │  (Docker)    │  │  (Système hôte)   │   │
│  └────────┬─────────┘  └──────┬───────┘  └────────┬──────────┘   │
│           │                   │                    │              │
│  ┌────────┴───────────────────┴────────────────────┴──────────┐  │
│  │              MongoDB Exporter :9216/metrics                 │  │
│  └──────────────────────────────────────────────────────────┬─┘  │
└─────────────────────────────────────────────────────────────│────┘
                                                              │
                    SCRAPE toutes les 15s                     │
                                                              ▼
                    ┌─────────────────────────────────────────┐
                    │         PROMETHEUS :9090                 │
                    │  Collecte, stocke (15 jours), évalue    │
                    │  les règles d'alerte                     │
                    └──────────────────┬──────────────────────┘
                                       │
                              Query (PromQL)
                                       │
                                       ▼
                    ┌─────────────────────────────────────────┐
                    │           GRAFANA :3001                  │
                    │  Dashboards, visualisation, alertes UI  │
                    └─────────────────────────────────────────┘
```

### Flux de données

1. Le **backend Node.js** génère des métriques via `prom-client` et les expose sur `/metrics`
2. **Prometheus** scrape (collecte) ces métriques toutes les 15 secondes
3. Prometheus **stocke** les données en série temporelle pendant 15 jours
4. **Grafana** interroge Prometheus via PromQL et affiche les graphiques
5. Les **règles d'alerte** sont évaluées par Prometheus toutes les 15 secondes

---

## Composants

### Prometheus `prom/prometheus:v2.51.2`

Prometheus est une base de données de séries temporelles spécialisée pour les métriques. Il fonctionne en **mode pull** : c'est lui qui va chercher les métriques chez les cibles, pas les cibles qui lui envoient.

**Fichiers de configuration :**
```
monitoring/prometheus/
├── prometheus.yml          ← Configuration principale (cibles, intervalles)
└── rules/
    └── alerts.yml          ← Règles d'alerte
```

### Grafana `grafana/grafana:10.4.2`

Interface de visualisation. Interroge Prometheus et affiche les données sous forme de graphiques, jauges et tableaux.

**Fichiers de configuration :**
```
monitoring/grafana/
├── provisioning/
│   ├── datasources/
│   │   └── prometheus.yml  ← Datasource Prometheus (auto-configurée)
│   └── dashboards/
│       └── dashboard.yml   ← Config du provider de dashboards
└── dashboards/
    ├── backend-dashboard.json   ← Dashboard applicatif
    └── system-dashboard.json    ← Dashboard infrastructure
```

### cAdvisor `gcr.io/cadvisor/cadvisor:v0.49.1`

Google Container Advisor. Collecte les métriques de chaque container Docker :
CPU, mémoire, réseau I/O, filesystem.

### MongoDB Exporter `percona/mongodb_exporter:0.40.0`

Traduit les statistiques internes de MongoDB en métriques Prometheus :
connexions actives, opérations, taille des collections, réplication.

### Node Exporter `prom/node-exporter:v1.7.0`

Collecte les métriques de la machine hôte :
CPU par cœur, mémoire RAM/swap, utilisation disque, réseau.

---

## Installation et démarrage

### Prérequis

- Docker Desktop installé et démarré
- Le projet cloné localement

### Démarrage complet

```bash
# 1. Se placer dans le projet
cd C:\anoors\codes\anoors_portfolio_react

# 2. Rebuilder le backend (contient prom-client)
docker-compose build backend

# 3. Démarrer tout le stack
docker-compose up -d

# 4. Vérifier que tout tourne
docker-compose ps
```

### Vérification de l'état

```bash
# Voir les logs du monitoring
docker-compose logs -f prometheus
docker-compose logs -f grafana

# Vérifier que les métriques sont exposées
curl http://localhost:5001/metrics

# Voir l'état des targets Prometheus
# → Ouvrir http://localhost:9090/targets dans le navigateur
```

### État attendu après démarrage

```
NAME                        STATUS    PORTS
portfolio_backend           running   0.0.0.0:5001->5000/tcp
portfolio_frontend          running   0.0.0.0:3000->80/tcp
portfolio_mongodb           running   0.0.0.0:27017->27017/tcp
portfolio_prometheus        running   0.0.0.0:9090->9090/tcp
portfolio_grafana           running   0.0.0.0:3001->3000/tcp
portfolio_cadvisor          running   0.0.0.0:8081->8080/tcp
portfolio_mongodb_exporter  running   0.0.0.0:9216->9216/tcp
portfolio_node_exporter     running   0.0.0.0:9100->9100/tcp
portfolio_jenkins           running   0.0.0.0:8080->8080/tcp
portfolio_sonarqube         running   0.0.0.0:9000->9000/tcp
```

---

## Métriques exposées

### Backend Node.js (`/metrics`)

Ces métriques sont créées manuellement dans `backend/server.js` via `prom-client`.

#### `http_requests_total` (Counter)

Compteur cumulatif du nombre de requêtes HTTP reçues.

| Label | Valeurs possibles | Description |
|---|---|---|
| `method` | GET, POST, PUT, DELETE | Méthode HTTP |
| `route` | /api/projets, /metrics... | Chemin de la route |
| `status_code` | 200, 404, 500... | Code de réponse HTTP |

**Exemple de valeur :**
```
http_requests_total{method="GET",route="/api/projets",status_code="200"} 42
```

**Requête PromQL pour le taux :**
```promql
rate(http_requests_total[1m])
```
→ Nombre de requêtes par seconde sur la dernière minute

---

#### `http_request_duration_seconds` (Histogram)

Durée de chaque requête HTTP, répartie dans des buckets de temps.

| Bucket | Signification |
|---|---|
| `le="0.01"` | Requêtes répondant en moins de 10ms |
| `le="0.1"` | Requêtes répondant en moins de 100ms |
| `le="0.5"` | Requêtes répondant en moins de 500ms |
| `le="2"` | Requêtes répondant en moins de 2 secondes |

**Requête PromQL pour le P95 :**
```promql
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)
```
→ 95% des requêtes répondent en moins de X secondes

---

#### `mongodb_connection_status` (Gauge)

Jauge binaire de l'état de la connexion MongoDB.

| Valeur | Signification |
|---|---|
| `1` | Connecté — la base de données répond |
| `0` | Déconnecté — l'application ne peut pas lire/écrire |

---

#### Métriques Node.js automatiques (collectées par `prom-client`)

| Métrique | Description |
|---|---|
| `nodejs_heap_size_used_bytes` | Mémoire heap utilisée par Node.js |
| `nodejs_heap_size_total_bytes` | Mémoire heap totale allouée |
| `nodejs_eventloop_lag_seconds` | Délai de l'event loop (> 100ms = surcharge) |
| `nodejs_active_handles_total` | Handles actifs (sockets, timers...) |
| `process_cpu_user_seconds_total` | CPU utilisé par le processus |
| `process_resident_memory_bytes` | Mémoire résidente totale |

---

### Métriques cAdvisor (Docker)

| Métrique | Description |
|---|---|
| `container_cpu_usage_seconds_total` | CPU cumulatif par container |
| `container_memory_usage_bytes` | RAM utilisée par container |
| `container_network_receive_bytes_total` | Trafic réseau entrant |
| `container_network_transmit_bytes_total` | Trafic réseau sortant |
| `container_fs_reads_bytes_total` | Lecture disque par container |

**Requête PromQL — CPU par container :**
```promql
sum by(name) (rate(container_cpu_usage_seconds_total{name!=""}[1m])) * 100
```

---

### Métriques Node Exporter (Système hôte)

| Métrique | Description |
|---|---|
| `node_cpu_seconds_total` | Temps CPU par mode (user, system, idle...) |
| `node_memory_MemTotal_bytes` | RAM totale de la machine |
| `node_memory_MemAvailable_bytes` | RAM disponible |
| `node_filesystem_avail_bytes` | Espace disque disponible |
| `node_network_receive_bytes_total` | Trafic réseau entrant hôte |

**Requête PromQL — CPU utilisé (%) :**
```promql
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

---

## Prometheus — Guide d'utilisation

### Accès

**URL :** http://localhost:9090

### Vérifier l'état des cibles (Targets)

1. Menu → **Status** → **Targets**
2. Chaque cible affiche :
   - 🟢 **UP** : Prometheus collecte les métriques avec succès
   - 🔴 **DOWN** : Erreur de connexion (voir la colonne Error)
   - La date du dernier scrape
   - La durée du scrape

**Cibles attendues :**

| Job | Endpoint | État attendu |
|---|---|---|
| `portfolio-backend` | backend:5000/metrics | UP |
| `mongodb` | mongodb-exporter:9216/metrics | UP |
| `cadvisor` | cadvisor:8080/metrics | UP |
| `node-exporter` | node-exporter:9100/metrics | UP |
| `prometheus` | localhost:9090/metrics | UP |

### Exécuter des requêtes PromQL

1. Cliquer sur **Graph** dans le menu
2. Saisir une expression dans le champ "Expression"
3. Cliquer **Execute**
4. Basculer entre l'onglet **Table** (valeur actuelle) et **Graph** (historique)

### Requêtes PromQL essentielles

```promql
# ── Requêtes HTTP ──────────────────────────────────────────

# Toutes les requêtes par seconde
sum(rate(http_requests_total[1m]))

# Requêtes par route (dernière minute)
sum by(route) (rate(http_requests_total[1m]))

# Uniquement les erreurs 5xx
sum(rate(http_requests_total{status_code=~"5.."}[5m]))

# Taux d'erreur en pourcentage
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m])) * 100

# ── Latence ────────────────────────────────────────────────

# Latence médiane (P50)
histogram_quantile(0.50,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Latence P95
histogram_quantile(0.95,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# Latence P99 (pire cas)
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# ── Mémoire Node.js ────────────────────────────────────────

# Heap utilisé en Mo
nodejs_heap_size_used_bytes / 1024 / 1024

# Ratio heap utilisé / total
nodejs_heap_size_used_bytes / nodejs_heap_size_total_bytes * 100

# ── Docker containers ──────────────────────────────────────

# CPU par container (%)
sum by(name) (rate(container_cpu_usage_seconds_total{name!=""}[1m])) * 100

# RAM par container (Mo)
container_memory_usage_bytes{name!=""} / 1024 / 1024

# ── Système ────────────────────────────────────────────────

# CPU hôte (%)
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# RAM disponible (Go)
node_memory_MemAvailable_bytes / 1024 / 1024 / 1024

# Statut MongoDB
mongodb_connection_status
```

### Vérifier les alertes actives

**Status** → **Alerts**

Chaque règle peut être dans l'état :
- **Inactive** : condition non remplie, tout va bien
- **Pending** : condition remplie mais le délai `for:` n'est pas encore écoulé
- **Firing** 🔴 : alerte active, action requise

---

## Grafana — Guide d'utilisation

### Accès

**URL :** http://localhost:3001  
**Login :** `admin` / `admin123`

### Navigation

```
Menu gauche :
├── Home          → Page d'accueil (dashboard par défaut)
├── Starred       → Dashboards favoris
├── Dashboards    → Tous les dashboards
│   └── Portfolio → Dossier du projet
│       ├── Portfolio Backend — Node.js
│       └── Portfolio — Infrastructure & Docker
├── Explore       → Requêtes PromQL libres (comme Prometheus UI)
├── Alerting      → Gestion des alertes
└── Administration → Paramètres, utilisateurs, plugins
```

### Accéder aux dashboards

1. Cliquer **Dashboards** dans le menu gauche
2. Ouvrir le dossier **Portfolio**
3. Choisir un dashboard

### Contrôles temporels

En haut à droite de chaque dashboard :

| Contrôle | Fonction |
|---|---|
| `Last 1 hour` | Période affichée — cliquer pour changer (5m, 1h, 24h, 7d...) |
| `30s` | Intervalle de rafraîchissement automatique |
| 🔍 Loupe `-` | Zoom arrière |
| Sélection à la souris | Zoom sur une période |

### Personnaliser une requête

1. Cliquer sur le titre d'un panel
2. **Edit**
3. Modifier l'expression PromQL dans le champ **Metrics browser**
4. Cliquer **Apply**

---

## Dashboards

### Dashboard 1 : Portfolio Backend — Node.js

**UID :** `portfolio-backend`  
**Fichier :** `monitoring/grafana/dashboards/backend-dashboard.json`

#### Panels

| Panel | Type | Métrique | Seuils |
|---|---|---|---|
| Requêtes/seconde | Stat | `sum(rate(http_requests_total[1m]))` | 🟡 >10, 🔴 >50 |
| Taux d'erreur 5xx | Stat | erreurs/total × 100 | 🟡 >1%, 🔴 >5% |
| Latence P95 | Stat | `histogram_quantile(0.95, ...)` | 🟡 >500ms, 🔴 >2s |
| Statut MongoDB | Stat | `mongodb_connection_status` | 🔴 =0 |
| Requêtes par route | Time series | par route + méthode | — |
| Histogramme latence | Time series | P50 / P95 / P99 | — |
| Mémoire heap | Time series | utilisé vs total | — |
| Event Loop Lag | Time series | `nodejs_eventloop_lag_seconds` | — |

#### Interprétation des valeurs

**Requêtes/seconde :**
- 0 à 1 req/s → dev local sans trafic
- 1 à 10 req/s → usage normal
- > 50 req/s → charge élevée pour t2.micro

**Taux d'erreur :**
- 0% → parfait
- "No data" → également parfait (aucune erreur = pas de calcul possible)
- > 1% → investigation requise dans les logs

**Latence P95 :**
- < 50ms → excellent
- 50-200ms → normal
- > 500ms → MongoDB lent ou requête complexe
- > 2s → problème critique

**Event Loop Lag :**
- < 10ms → Node.js fluide
- > 50ms → code synchrone bloquant
- > 100ms → problème sérieux

---

### Dashboard 2 : Portfolio — Infrastructure & Docker

**UID :** `portfolio-infra`  
**Fichier :** `monitoring/grafana/dashboards/system-dashboard.json`

#### Panels

| Panel | Métrique source | Ce qu'on surveille |
|---|---|---|
| CPU Hôte (%) | Node Exporter | Surchauffe de la machine |
| RAM Disponible | Node Exporter | Risque d'OOM (Out of Memory) |
| CPU par container | cAdvisor | Quel container consomme le plus |
| Mémoire par container | cAdvisor | Fuites mémoire par container |
| Réseau I/O | cAdvisor | Trafic entrant/sortant par container |

---

## Alertes

Les alertes sont définies dans `monitoring/prometheus/rules/alerts.yml` et évaluées par Prometheus toutes les 15 secondes.

### Liste complète des alertes

#### BackendDown
```yaml
Condition : up{job="portfolio-backend"} == 0
Délai     : 1 minute
Sévérité  : critical
```
Se déclenche si Prometheus ne peut plus scraper le backend pendant 1 minute. Cause : container arrêté, crash Node.js, port non accessible.

---

#### HighErrorRate
```yaml
Condition : rate(http_5xx[5m]) / rate(http_total[5m]) > 0.05
Délai     : 2 minutes
Sévérité  : warning
```
Plus de 5% des requêtes retournent une erreur serveur sur 5 minutes. Cause : bug applicatif, base de données inaccessible, erreur de code.

---

#### HighLatency
```yaml
Condition : histogram_quantile(0.95, ...) > 2
Délai     : 2 minutes
Sévérité  : warning
```
Le 95e percentile de latence dépasse 2 secondes. Cause : requête MongoDB non indexée, charge CPU, mémoire insuffisante.

---

#### MongoDBDown
```yaml
Condition : up{job="mongodb"} == 0
Délai     : 1 minute
Sévérité  : critical
```
L'exporter MongoDB ne répond plus. Cause : container MongoDB arrêté.

---

#### MongoDBDisconnected
```yaml
Condition : mongodb_connection_status == 0
Délai     : 30 secondes
Sévérité  : critical
```
Le backend a perdu sa connexion MongoDB. Plus critique que MongoDBDown car détecté depuis l'intérieur de l'application.

---

#### HighCPU
```yaml
Condition : CPU idle < 20% → usage > 80%
Délai     : 5 minutes
Sévérité  : warning
```
La machine hôte est surchargée depuis 5 minutes. Cause : build Docker, Jenkins pipeline actif, autre processus lourd.

---

#### LowMemory
```yaml
Condition : node_memory_MemAvailable_bytes < 200Mi
Délai     : 2 minutes
Sévérité  : warning
```
Moins de 200 Mo de RAM disponible. Risque d'OOM killer qui tuerait des containers.

### Tester une alerte manuellement

```bash
# Test BackendDown
docker-compose stop backend
# → Attendre 1 minute
# → http://localhost:9090/alerts → BackendDown passe en FIRING
docker-compose start backend
# → Alerte résorbée après le prochain scrape

# Test MongoDBDisconnected
docker-compose stop mongodb
# → Attendre 30 secondes
# → Alerte active
docker-compose start mongodb
```

---

## Résolution de problèmes

### "No data" dans Grafana

**Vérification 1 — La datasource est-elle configurée ?**
```
Grafana → Connections → Data sources → Prometheus
→ Cliquer "Save & test" → doit afficher "Data source is working"
```

**Vérification 2 — Prometheus reçoit-il les métriques ?**
```
http://localhost:9090/targets
→ portfolio-backend doit être UP
```

**Vérification 3 — Le backend expose-t-il /metrics ?**
```
http://localhost:5001/metrics
→ Doit retourner du texte avec des métriques
→ Si 404 : rebuilder l'image backend
```

**Solution si backend DOWN :**
```bash
docker-compose build backend
docker-compose up -d --no-deps backend
```

---

### Target DOWN dans Prometheus

| Message d'erreur | Cause | Solution |
|---|---|---|
| `connection refused` | Container arrêté | `docker-compose start <service>` |
| `404 Not Found` | Route `/metrics` absente | Rebuilder l'image |
| `no such host` | Réseau Docker non configuré | `docker-compose down && docker-compose up -d` |
| `context deadline exceeded` | Timeout — service trop lent | Vérifier les logs du service |

---

### Grafana ne démarre pas

```bash
# Vérifier les logs
docker-compose logs grafana

# Problème de permissions sur les volumes
docker-compose down
docker volume rm anoors_portfolio_react_grafana_data
docker-compose up -d grafana
```

---

### Prometheus ne charge pas les règles d'alerte

```bash
# Vérifier la syntaxe du fichier de règles
docker run --rm \
  -v $(pwd)/monitoring/prometheus/rules:/rules \
  prom/prometheus:v2.51.2 \
  promtool check rules /rules/alerts.yml

# Recharger la configuration sans redémarrer
curl -X POST http://localhost:9090/-/reload
```

---

## Référence des URLs

| Service | URL | Credentials |
|---|---|---|
| Application Frontend | http://localhost:3000 | — |
| Backend API | http://localhost:5001/api/projets | — |
| **Métriques Backend** | http://localhost:5001/metrics | — |
| **Prometheus UI** | http://localhost:9090 | — |
| Prometheus Targets | http://localhost:9090/targets | — |
| Prometheus Alerts | http://localhost:9090/alerts | — |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| cAdvisor UI | http://localhost:8081 | — |
| MongoDB Exporter | http://localhost:9216/metrics | — |
| Node Exporter | http://localhost:9100/metrics | — |
| Jenkins | http://localhost:8080 | admin / (configuré) |
| SonarQube | http://localhost:9000 | admin / admin |

---

## Structure des fichiers

```
monitoring/
├── prometheus/
│   ├── prometheus.yml              ← Configuration Prometheus
│   └── rules/
│       └── alerts.yml              ← 7 règles d'alerte
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── prometheus.yml      ← Datasource auto-configurée
    │   └── dashboards/
    │       └── dashboard.yml       ← Provider de dashboards
    └── dashboards/
        ├── backend-dashboard.json  ← Dashboard Node.js
        └── system-dashboard.json   ← Dashboard Infrastructure

backend/
├── server.js                       ← Route /metrics + métriques prom-client
└── package.json                    ← prom-client: ^15.1.3

docker-compose.yml                  ← Services prometheus, grafana,
                                       cadvisor, mongodb-exporter,
                                       node-exporter
```
