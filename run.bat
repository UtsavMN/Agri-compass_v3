@echo off
setlocal

echo ==========================================
echo 🌱 Agri-Compass Quick Run
echo ==========================================

:: Set default environment variables for backend
set PORT=8080
set DB_URL=jdbc:sqlite:agri.db

:: Load variables from frontend\.env if it exists (overwrites defaults)
if exist "frontend\.env" (
    echo 📝 Loading environment variables from frontend\.env...
    for /f "usebackq tokens=*" %%i in ("frontend\.env") do (
        set %%i
    )
)

echo.
echo 🚀 Starting Spring Boot Backend...
start "Agri-Compass Backend" cmd /c "cd agri-compass-api && mvnw.cmd spring-boot:run"

echo 🎨 Starting Vite Frontend...
cd frontend
:: Check for node_modules
if not exist "node_modules\" (
    echo 📦 node_modules not found, installing dependencies...
    call npm install
)
npm run dev
