@echo off
echo ===================================================
echo [PAUSE NEON] Activating Local SQLite mode
echo Neon PostgreSQL connections paused to save quota.
echo ===================================================
powershell -Command "(Get-Content .env) -replace 'PAUSE_NEON=.*', 'PAUSE_NEON=true' | Set-Content .env"
powershell -Command "(Get-Content agri-compass-api\.env) -replace 'PAUSE_NEON=.*', 'PAUSE_NEON=true' | Set-Content agri-compass-api\.env"
echo Mode set to: PAUSE_NEON=true (0 Neon compute hours will be used)
echo Restart backend to apply.
pause
