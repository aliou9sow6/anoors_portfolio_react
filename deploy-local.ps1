# Script de déploiement Kubernetes local
param(
    [string]$Target = "docker-compose" # "docker-compose" ou "kubernetes"
)

Write-Host "====== PORTFOLIO DEPLOYMENT SCRIPT ======" -ForegroundColor Cyan

if ($Target -eq "docker-compose") {
    Write-Host "`n1️⃣  Déploiement avec Docker Compose..." -ForegroundColor Yellow
    
    # Mettre à jour les images dans docker-compose
    Write-Host "Mise à jour du fichier docker-compose.yml..." -ForegroundColor Green
    
    $composeFile = "docker-compose.yml"
    $content = Get-Content $composeFile
    
    # Remplacer les images
    $content = $content -replace "image: anoor9s6/portfolio-backend:latest", "image: portfolio-backend:v1"
    $content = $content -replace "image: anoor9s6/portfolio-frontend:latest", "image: portfolio-frontend:v1"
    
    Set-Content -Path $composeFile -Value $content
    
    # Lancer docker-compose
    Write-Host "Lancement de Docker Compose..." -ForegroundColor Green
    docker-compose down 2>&1 | Out-Null
    docker-compose up -d
    
    Write-Host "`n✅ Docker Compose déployé !" -ForegroundColor Green
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Backend: http://localhost:5001/api" -ForegroundColor Cyan
    docker-compose ps
}
elseif ($Target -eq "kubernetes") {
    Write-Host "`n2️⃣  Déploiement avec Kubernetes..." -ForegroundColor Yellow
    
    # Vérifier si kubectl fonctionne
    $kubectlVersion = kubectl version --client 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur: kubectl n'est pas configuré correctement" -ForegroundColor Red
        Write-Host "Sortie: $kubectlVersion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ kubectl est disponible" -ForegroundColor Green
    
    # Créer le namespace
    Write-Host "`nCréation du namespace 'portfolio'..." -ForegroundColor Green
    kubectl apply -f k8s/namespace.yaml
    
    # Appliquer les manifests
    Write-Host "`nDéploiement des ressources Kubernetes..." -ForegroundColor Green
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/backend-service.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/frontend-service.yaml
    
    # Vérifier le statut
    Write-Host "`n📊 Statut du déploiement..." -ForegroundColor Green
    kubectl get pods -n portfolio
    
    Write-Host "`n✅ Kubernetes déployé !" -ForegroundColor Green
    Write-Host "   Namespace: portfolio" -ForegroundColor Cyan
    Write-Host "   Pour accéder au frontend:" -ForegroundColor Cyan
    Write-Host "   kubectl port-forward -n portfolio svc/portfolio-frontend 3000:80" -ForegroundColor Cyan
    Write-Host "   Puis accédez à http://localhost:3000" -ForegroundColor Cyan
}
else {
    Write-Host "Usage: .\deploy-local.ps1 -Target docker-compose|kubernetes" -ForegroundColor Red
    exit 1
}
