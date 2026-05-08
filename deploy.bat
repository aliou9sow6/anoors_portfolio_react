@echo off
REM Portfolio Docker - Script Windows
REM Utilisation: .\deploy.bat [commande]

if "%1"=="help" goto help
if "%1"=="build" goto build
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="reset" goto reset
if "%1"=="seed" goto seed

REM Par défaut, afficher l'aide
goto help

:help
echo.
echo 🚀 Portfolio Docker - Commandes Windows
echo.
echo 📋 Commandes disponibles:
echo   help     - Afficher cette aide
echo   build    - Construire les images Docker
echo   up       - Démarrer tous les services
echo   down     - Arrêter tous les services
echo   dev      - Mode développement avec hot-reload
echo   prod     - Mode production optimisé
echo   logs     - Afficher les logs
echo   status   - Statut des services
echo   clean    - Nettoyer les conteneurs
echo   reset    - Reset complet (⚠️ supprime les données)
echo   seed     - Importer les données de test
echo.
echo 💡 Exemples:
echo   .\deploy.bat up
echo   .\deploy.bat dev
echo   .\deploy.bat logs
echo.
goto end

:build
echo 🏗️ Construction des images Docker...
docker-compose build
goto end

:up
echo 🚀 Démarrage des services...
docker-compose up -d
timeout /t 5 /nobreak > nul
goto status

:down
echo 🛑 Arrêt des services...
docker-compose down
goto end

:dev
echo 🔧 Mode développement avec hot-reload...
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
echo 📝 Hot-reload activé - Les changements seront automatiquement appliqués
goto end

:prod
echo 🏭 Mode production optimisé...
docker-compose up --build -d
echo ⚡ Services optimisés pour la production
goto end

:logs
docker-compose logs -f
goto end

:status
echo.
echo 📊 Statut des services:
docker-compose ps
echo.
echo 🔗 URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   MongoDB:  localhost:27017
echo.
echo 🧪 Test des endpoints:
curl -s http://localhost:5000/api/test >nul 2>&1 && echo   ✅ Backend OK || echo   ❌ Backend KO
curl -s http://localhost:3000 >nul 2>&1 && echo   ✅ Frontend OK || echo   ❌ Frontend KO
echo.
goto end

:clean
echo 🧹 Nettoyage des conteneurs et images...
docker-compose down -v
docker system prune -f
docker image prune -f
goto end

:reset
echo ⚠️ ATTENTION: Cette commande supprime TOUTES les données !
set /p confirm="Êtes-vous sûr ? (tapez 'yes' pour confirmer): "
if "%confirm%"=="yes" (
    echo 🔥 Reset complet en cours...
    docker-compose down -v
    docker system prune -a -f
    docker volume prune -f
    echo ✅ Reset terminé
) else (
    echo ❌ Reset annulé
)
goto end

:seed
echo 🌱 Import des données de test...
docker-compose exec backend npm run seed
goto end

:end