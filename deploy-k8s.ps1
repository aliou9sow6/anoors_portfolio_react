# Script de déploiement Kubernetes automatisé
# Utilisation: .\deploy-k8s.ps1 -Action deploy|destroy|status|logs

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("deploy", "destroy", "status", "logs", "portforward")]
    [string]$Action = "deploy"
)

$namespace = "portfolio"
$k8sDir = ".\k8s"

function Write-Header {
    param([string]$msg)
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Check-Kubernetes {
    Write-Header "Vérification Kubernetes"
    
    try {
        $version = kubectl version --client 2>&1
        Write-Host "✓ kubectl est disponible" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ kubectl non trouvé. Installez Kubernetes d'abord." -ForegroundColor Red
        exit 1
    }
    
    try {
        $cluster = kubectl cluster-info 2>&1
        Write-Host "✓ Cluster Kubernetes est actif" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Aucun cluster Kubernetes n'est en cours d'exécution." -ForegroundColor Red
        Write-Host "  - Docker Desktop: Settings > Kubernetes > Enable"
        Write-Host "  - Minikube: minikube start"
        exit 1
    }
}

function Deploy {
    Write-Header "Déploiement sur Kubernetes"
    
    Write-Host "1. Création du namespace..."
    kubectl apply -f "$k8sDir\namespace.yaml"
    Start-Sleep -Seconds 2
    
    Write-Host "2. Déploiement du backend..."
    kubectl apply -f "$k8sDir\backend-deployment.yaml"
    kubectl apply -f "$k8sDir\backend-service.yaml"
    Start-Sleep -Seconds 2
    
    Write-Host "3. Déploiement du frontend..."
    kubectl apply -f "$k8sDir\frontend-deployment.yaml"
    kubectl apply -f "$k8sDir\frontend-service.yaml"
    Start-Sleep -Seconds 5
    
    Write-Host "4. Attendre que les pods soient prêts..."
    kubectl wait --for=condition=ready pod -l app=portfolio-backend -n $namespace --timeout=60s 2>$null
    kubectl wait --for=condition=ready pod -l app=portfolio-frontend -n $namespace --timeout=60s 2>$null
    
    Write-Header "Déploiement terminé ✓"
    ShowStatus
}

function Destroy {
    Write-Header "Suppression du déploiement"
    
    $confirm = Read-Host "Êtes-vous sûr ? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Annulé." -ForegroundColor Yellow
        return
    }
    
    kubectl delete namespace $namespace
    Write-Host "✓ Namespace supprimé" -ForegroundColor Green
}

function ShowStatus {
    Write-Header "État des déploiements"
    
    Write-Host "`nDéploiements:" -ForegroundColor Yellow
    kubectl get deployments -n $namespace
    
    Write-Host "`nPods:" -ForegroundColor Yellow
    kubectl get pods -n $namespace
    
    Write-Host "`nServices:" -ForegroundColor Yellow
    kubectl get svc -n $namespace
    
    Write-Host "`nCommandes utiles:" -ForegroundColor Cyan
    Write-Host "  Port-Forward Frontend: kubectl port-forward -n $namespace svc/portfolio-frontend-service 3000:3000"
    Write-Host "  Port-Forward Backend : kubectl port-forward -n $namespace svc/portfolio-backend-service 5000:5000"
    Write-Host "  Logs Backend         : kubectl logs -n $namespace -l app=portfolio-backend --tail=50 -f"
    Write-Host "  Logs Frontend        : kubectl logs -n $namespace -l app=portfolio-frontend --tail=50 -f"
}

function ShowLogs {
    Write-Header "Logs des pods"
    
    Write-Host "`nBackend logs:" -ForegroundColor Yellow
    kubectl logs -n $namespace -l app=portfolio-backend --tail=50
    
    Write-Host "`nFrontend logs:" -ForegroundColor Yellow
    kubectl logs -n $namespace -l app=portfolio-frontend --tail=50
}

function PortForward {
    Write-Header "Port-Forward Setup"
    
    Write-Host "Configuration port-forward..."
    Write-Host "1. Frontend sur http://localhost:3000" -ForegroundColor Green
    Write-Host "2. Backend sur http://localhost:5000" -ForegroundColor Green
    
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n $namespace svc/portfolio-frontend-service 3000:3000"
    Start-Sleep -Seconds 1
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "kubectl port-forward -n $namespace svc/portfolio-backend-service 5000:5000"
    
    Write-Host "Appuyez sur Ctrl+C pour arrêter." -ForegroundColor Yellow
}

# Exécution principale
Check-Kubernetes

switch ($Action) {
    "deploy" { Deploy }
    "destroy" { Destroy }
    "status" { ShowStatus }
    "logs" { ShowLogs }
    "portforward" { PortForward }
    default { Deploy }
}
