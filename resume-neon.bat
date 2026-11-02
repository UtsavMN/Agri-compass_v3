@echo off
echo ===================================================
echo [RESUME NEON] Activating Cloud Neon PostgreSQL
echo Connecting to Neon for Presentation on Nov 6th!
echo ===================================================
powershell -Command "(Get-Content .env) -replace 'PAUSE_NEON=.*', 'PAUSE_NEON=false' | Set-Content .env"
powershell -Command "(Get-Content agri-compass-api\.env) -replace 'PAUSE_NEON=.*', 'PAUSE_NEON=false' | Set-Content agri-compass-api\.env"
echo Mode set to: PAUSE_NEON=false (Connected to Neon Cloud PostgreSQL)
echo Restart backend to apply.
pause
