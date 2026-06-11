# ============================================
# SCRIPT DE DÉPLOIEMENT KUBERNETES
# Portfolio React - Déploiement Automatisé
# ============================================

param(
    [string]$Action = "deploy",  # "deploy", "delete", "restart", "logs", "status"
    [string]$Namespace = "portfolio"
)

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PORTFOLIO - KUBERNETES DEPLOYMENT SCRIPT      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Vérifier que kubectl est installé
try {
    $kubectlVersion = kubectl version --client 2>&1 | Out-String
    Write-Host "✓ kubectl disponible" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: kubectl n'est pas installé ou non configuré" -ForegroundColor Red
    Write-Host "   Installez Docker Desktop avec Kubernetes activé, ou Minikube" -ForegroundColor Yellow
    exit 1
}

# Vérifier la connexion au cluster
try {
    $clusterInfo = kubectl cluster-info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Cluster non accessible"
    }
    Write-Host "✓ Cluster Kubernetes accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ ERREUR: Impossible de se connecter au cluster Kubernetes" -ForegroundColor Red
    Write-Host "   Assurez-vous que:" -ForegroundColor Yellow
    Write-Host "   1. Docker Desktop Kubernetes est activé (Settings → Kubernetes → Enable)" -ForegroundColor Yellow
    Write-Host "   OU" -ForegroundColor Yellow
    Write-Host "   2. Minikube est démarré (minikube start)" -ForegroundColor Yellow
    exit 1
}

function Deploy-Kubernetes {
    Write-Host "`n🚀 DÉPLOIEMENT EN COURS...\n" -ForegroundColor Yellow
    
    # 1. Namespace
    Write-Host "1️⃣  Créer le namespace '$Namespace'..." -ForegroundColor Cyan
    kubectl apply -f k8s/namespace.yaml
    Start-Sleep -Seconds 1
    
    # 2. Backend
    Write-Host "`n2️⃣  Déployer le backend..." -ForegroundColor Cyan
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/backend-service.yaml
    Start-Sleep -Seconds 2
    
    # 3. Frontend
    Write-Host "`n3️⃣  Déployer le frontend..." -ForegroundColor Cyan
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/frontend-service.yaml
    Start-Sleep -Seconds 2
    
    # 4. Attendre les pods
    Write-Host "`n⏳ Attendre le démarrage des pods (max 60s)..." -ForegroundColor Cyan
    $maxAttempts = 60
    $attempts = 0
    
    while ($attempts -lt $maxAttempts) {
        $podStatus = kubectl get pods -n $Namespace --no-headers 2>&1 | Select-String "Running"
        $podCount = @($podStatus).Count
        
        if ($podCount -ge 4) {
            Write-Host "✓ Tous les pods sont en Running!" -ForegroundColor Green
            break
        }
        
        Write-Host "  Pods Running: $podCount/4..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
        $attempts++
    }
    
    if ($attempts -ge $maxAttempts) {
        Write-Host "⚠️  Certains pods n'ont pas démarré après 60s" -ForegroundColor Yellow
        Write-Host "   Utilisez: kubectl logs -n $Namespace deployment/portfolio-backend" -ForegroundColor Yellow
    }
    
    # 5. Afficher le statut
    Show-Status
    
    # 6. Instructions d'accès
    Write-Host "`n✅ DÉPLOIEMENT TERMINÉ!\n" -ForegroundColor Green
    Write-Host "📝 PROCHAINES ÉTAPES:" -ForegroundColor Cyan
    Write-Host "   1. Accéder à l'application:" -ForegroundColor White
    Write-Host "      kubectl port-forward -n $Namespace svc/portfolio-frontend 3000:80" -ForegroundColor Yellow
    Write-Host "      → Ouvrez http://localhost:3000 dans votre navigateur" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor White
    Write-Host "   2. Accéder à l'API (dans un autre terminal):" -ForegroundColor White
    Write-Host "      kubectl port-forward -n $Namespace svc/portfolio-backend 5000:5000" -ForegroundColor Yellow
    Write-Host "      → Testez http://localhost:5000/api/projets" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor White
    Write-Host "   3. Voir les logs:" -ForegroundColor White
    Write-Host "      kubectl logs -f -n $Namespace deployment/portfolio-backend" -ForegroundColor Yellow
    Write-Host "      kubectl logs -f -n $Namespace deployment/portfolio-frontend" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor White
    Write-Host "   4. Arrêter:" -ForegroundColor White
    Write-Host "      kubectl delete namespace $Namespace" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor White
}

function Show-Status {
    Write-Host "`n📊 STATUT DES RESSOURCES:\n" -ForegroundColor Cyan
    
    Write-Host "Pods:" -ForegroundColor White
    kubectl get pods -n $Namespace --no-headers
    
    Write-Host "`nServices:" -ForegroundColor White
    kubectl get svc -n $Namespace --no-headers
    
    Write-Host "`nDeployments:" -ForegroundColor White
    kubectl get deployments -n $Namespace --no-headers
}

function Show-Logs {
    param([string]$Component = "all")
    
    Write-Host "`n📋 LOGS:\n" -ForegroundColor Cyan
    
    if ($Component -eq "all" -or $Component -eq "backend") {
        Write-Host "Backend logs:" -ForegroundColor Yellow
        kubectl logs -f deployment/portfolio-backend -n $Namespace
    }
    
    if ($Component -eq "all" -or $Component -eq "frontend") {
        Write-Host "`nFrontend logs:" -ForegroundColor Yellow
        kubectl logs -f deployment/portfolio-frontend -n $Namespace
    }
}

function Delete-Deployment {
    Write-Host "`n🗑️  SUPPRESSION EN COURS...\n" -ForegroundColor Yellow
    
    Write-Host "Suppression du namespace '$Namespace'..." -ForegroundColor Cyan
    kubectl delete namespace $Namespace --ignore-not-found=true
    
    Write-Host "✓ Namespace supprimé" -ForegroundColor Green
}

function Restart-Deployment {
    Write-Host "`n🔄 REDÉMARRAGE EN COURS...\n" -ForegroundColor Yellow
    
    Write-Host "Redémarrage du backend..." -ForegroundColor Cyan
    kubectl rollout restart deployment/portfolio-backend -n $Namespace
    
    Write-Host "Redémarrage du frontend..." -ForegroundColor Cyan
    kubectl rollout restart deployment/portfolio-frontend -n $Namespace
    
    Write-Host "`n⏳ Attendre le redémarrage..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    Show-Status
    Write-Host "`n✓ Redémarrage terminé" -ForegroundColor Green
}

# Exécuter l'action
switch ($Action.ToLower()) {
    "deploy" {
        Deploy-Kubernetes
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "delete" {
        Delete-Deployment
    }
    "restart" {
        Restart-Deployment
    }
    default {
        Write-Host "`nUsage: .\deploy-kubernetes.ps1 -Action <deploy|status|logs|delete|restart>" -ForegroundColor Yellow
        Write-Host "`nExemples:" -ForegroundColor Cyan
        Write-Host "  .\deploy-kubernetes.ps1 -Action deploy     # Déployer sur Kubernetes" -ForegroundColor White
        Write-Host "  .\deploy-kubernetes.ps1 -Action status     # Voir le statut" -ForegroundColor White
        Write-Host "  .\deploy-kubernetes.ps1 -Action logs       # Afficher les logs" -ForegroundColor White
        Write-Host "  .\deploy-kubernetes.ps1 -Action restart    # Redémarrer" -ForegroundColor White
        Write-Host "  .\deploy-kubernetes.ps1 -Action delete     # Supprimer" -ForegroundColor White
    }
}

Write-Host ""
