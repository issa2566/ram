@echo off
chcp 65001 > nul
cls

echo ═══════════════════════════════════════════════════════════
echo     🚀 Démarrage complet du projet
echo     (Backend + Frontend)
echo ═══════════════════════════════════════════════════════════
echo.

echo Arrêt des processus Node.js existants...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo ✅ Processus arrêtés
echo.

echo ═══════════════════════════════════════════════════════════
echo Étape 1/2: Démarrage du Backend...
echo ═══════════════════════════════════════════════════════════

start "Backend Server - NE PAS FERMER" cmd /k "%~dp0DEMARRER_BACKEND.bat"

echo ✅ Backend démarré dans une fenêtre séparée
echo.

echo ⏳ Attente de 10 secondes pour que le backend démarre...
timeout /t 10 /nobreak

echo.
echo ═══════════════════════════════════════════════════════════
echo Étape 2/2: Démarrage du Frontend...
echo ═══════════════════════════════════════════════════════════

start "Frontend - NE PAS FERMER" cmd /k "%~dp0DEMARRER_FRONTEND.bat"

echo ✅ Frontend démarré dans une fenêtre séparée
echo.

echo ⏳ Attente de 5 secondes...
timeout /t 5 /nobreak

echo.
echo ═══════════════════════════════════════════════════════════
echo     ✅ PROJET DÉMARRÉ AVEC SUCCÈS!
echo ═══════════════════════════════════════════════════════════
echo.

echo 📍 URLs:
echo    - Frontend: http://localhost:8080
echo    - Backend:  http://localhost:3000
echo.

echo 🎯 Utilisation:
echo    1. Ouvrez votre navigateur: http://localhost:8080
echo    2. Cliquez sur "Se connecter"
echo    3. Connectez-vous avec:
echo       Email: admin@example.com
echo       Mot de passe: admin123
echo.

echo ⚠️  NE FERMEZ PAS les autres fenêtres!
echo.

echo 🔧 Pour arrêter le projet:
echo    - Fermez les fenêtres Backend et Frontend
echo    - Ou exécutez: taskkill /f /im node.exe
echo.

echo ═══════════════════════════════════════════════════════════
echo.

echo Ouverture du navigateur dans 3 secondes...
timeout /t 3 /nobreak > nul

start http://localhost:8080

echo.
echo ✅ Navigateur ouvert!
echo.
echo Vous pouvez maintenant fermer cette fenêtre.
echo Les fenêtres Backend et Frontend doivent rester ouvertes.
echo.

pause
