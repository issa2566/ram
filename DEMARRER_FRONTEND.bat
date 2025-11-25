@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🎨 Démarrage du Frontend
echo ═══════════════════════════════════════════════════════════
echo.

echo Navigation vers le dossier frontend...
cd /d "%~dp0auto-display-replicator-main"

if not exist "package.json" (
    echo ❌ ERREUR: package.json introuvable!
    echo Dossier actuel: %CD%
    pause
    exit /b 1
)

echo ✅ Dossier frontend trouvé
echo.

echo Installation des dépendances...
if not exist "node_modules" (
    call npm install
    echo ✅ Installation terminée
) else (
    echo ✅ Dépendances déjà installées
)
echo.

echo ═══════════════════════════════════════════════════════════
echo     ✅ Démarrage du frontend...
echo ═══════════════════════════════════════════════════════════
echo.
echo 📍 URL de l'application: http://localhost:8080
echo.
echo ⚠️  NE FERMEZ PAS CETTE FENÊTRE!
echo.
echo ═══════════════════════════════════════════════════════════
echo.

call npm run dev

pause
