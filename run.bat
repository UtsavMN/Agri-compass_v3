@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo 🌱 Agri-Compass Quick Run (v3.1)
echo ==========================================

:: Clear common ports if they are in use
echo 🧹 Clearing ports 8080 and 5173...
call npx kill-port 8080 5173 >nul 2>&1

:: Detect JAVA_HOME if not valid
echo 🔍 Detecting Java 17+...
if not exist "%JAVA_HOME%\bin\java.exe" (
    for /f "delims=" %%i in ('call find_jdk.bat') do set "DETECTED_JAVA=%%i"
    if not "!DETECTED_JAVA!"=="" (
        echo ✅ Found Java at: !DETECTED_JAVA!
        set "JAVA_HOME=!DETECTED_JAVA!"
        set "PATH=!DETECTED_JAVA!\bin;%PATH%"
    ) else (
        echo ❌ No Java 17+ found! Please install OpenJDK 17 or higher.
        pause
        exit /b 1
    )
) else (
    echo ✅ Using existing JAVA_HOME: %JAVA_HOME%
)

:: Load variables from root .env and frontend\.env if they exist
set "ENV_FILES=.env frontend\.env"
for %%F in (%ENV_FILES%) do (
    if exist "%%F" (
        echo 📝 Loading environment variables from %%F...
        for /f "usebackq tokens=*" %%i in ("%%F") do (
            echo %%i | findstr /b /c:"#" >nul || (
                set "%%i"
            )
        )
    )
)

:: Default fallbacks
if "!PORT!"=="" set PORT=8080
if "!DB_URL!"=="" set DB_URL=jdbc:sqlite:agri.db

echo.
echo 🚀 Starting Spring Boot Backend...
pushd agri-compass-api
:: Ensure mvnw uses the correct Java
start "Agri-Compass Backend" cmd /c "set JAVA_HOME=%JAVA_HOME% && set PATH=%JAVA_HOME%\bin;%PATH% && mvnw.cmd spring-boot:run"
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
