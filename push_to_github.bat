@echo off
echo ==========================================
echo Pushing Dream Bakes code to GitHub...
echo ==========================================
cd /d "%~dp0"
git push -u origin main
echo ==========================================
echo Push completed! Press any key to exit.
echo ==========================================
pause
