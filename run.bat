@echo off
setlocal

echo ==========================================
echo 🌱 Agri-Compass Quick Run (v3.1)
echo ==========================================

:: Clear common ports if they are in use
echo 🧹 Clearing ports 8080 and 5173...
npx kill-port 8080 5173 >nul 2>&1

:: Load variables from frontend\.env if it exists
if exist "frontend\.env" (
    echo 📝 Loading environment variables from frontend\.env...
    for /f "usebackq tokens=*" %%i in ("frontend\.env") do (
        echo %%i | findstr /b /c:"#" >nul || (
            set "%%i"
        )
    )
) else (
    echo ⚠️ frontend\.env not found. Using defaults.
    set PORT=8080
    set DB_URL=jdbc:sqlite:agri.db
)

echo.
echo 🚀 Starting Spring Boot Backend...
:: Using pushd/popd to ensure correct directory context
pushd agri-compass-api
start "Agri-Compass Backend" cmd /c "mvnw.cmd spring-boot:run"
popd

echo 🎨 Starting Vite Frontend...
pushd frontend
:: Check for node_modules
if not exist "node_modules\" (
    echo 📦 node_modules not found, installing dependencies...
    call npm install
)
npm run dev
popd
