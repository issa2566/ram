@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🚀 Démarrage du serveur Backend
echo ═══════════════════════════════════════════════════════════
echo.

echo Étape 1: Arrêt des processus Node.js existants...
taskkill /f /im node.exe >nul 2>&1

echo ✅ Processus arrêtés
echo.

echo Étape 2: Navigation vers le dossier backend...
cd /d "%~dp0backend"

if not exist "server.js" (
    echo ❌ ERREUR: server.js introuvable!
    echo Dossier actuel: %CD%
    pause
    exit /b 1
)

echo ✅ Fichier server.js trouvé
echo 📍 Dossier: %CD%
echo.

echo Étape 3: Installation des dépendances...
if not exist "node_modules" (
    echo Installation en cours...
    call npm install
    echo ✅ Installation terminée
) else (
    echo ✅ Dépendances déjà installées
)
echo.

echo Étape 4: Vérification de bcrypt...
call npm install bcrypt >nul 2>&1
echo ✅ bcrypt OK
echo.

echo ═══════════════════════════════════════════════════════════
echo     ✅ Démarrage du serveur...
echo ═══════════════════════════════════════════════════════════
echo.
echo 📍 URL du serveur: http://69.169.108.182:3000
echo.
echo ⚠️  NE FERMEZ PAS CETTE FENÊTRE!
echo.
echo Pour tester: ouvrez http://69.169.108.182:3000 dans votre navigateur
echo.
echo ═══════════════════════════════════════════════════════════
echo.

node server.js

echo.
echo ❌ Le serveur s'est arrêté!
pause
