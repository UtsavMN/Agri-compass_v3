@echo off
setlocal

echo ==========================================================
echo 🌱 Agri-Compass Setup Script (Windows)
echo ==========================================================
echo.

:: Check for Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed or not in PATH. Please install Java 17.
    exit /b 1
)

:: Output Java version
for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVAVER=%%g
)
echo ✅ Java detected: %JAVAVER%

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH. Please install Node.js.
    exit /b 1
)

for /f "tokens=*" %%g in ('node -v') do (
    set NODEVER=%%g
)
echo ✅ Node.js detected: %NODEVER%
echo.

echo 📦 Installing Frontend Dependencies...
call npm install

echo.
echo 🚀 Starting Agri-Compass...
echo ----------------------------------------------------------
echo NOTE: Two processes will start. Close this window to stop both.
echo ----------------------------------------------------------

:: Start frontend in a new minimized window
start "Agri-Compass Frontend" /MIN cmd /c "npm run dev"

:: Start backend in this window
echo Starting Spring Boot Backend on port 8080...
cd agri-compass-api
call mvnw.cmd spring-boot:run
