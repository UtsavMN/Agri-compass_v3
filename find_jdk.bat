@echo off
setlocal enabledelayedexpansion

:: List of potential JDK root paths to check
set "SEARCH_PATHS="C:\Program Files\Java" "C:\Program Files\Eclipse Adoptium" "C:\Program Files\Eclipse Foundation" "C:\Program Files\Adoptium" "C:\Program Files\Microsoft" "C:\Program Files\RedHat" "C:\Program Files\Amazon Corretto" "C:\Program Files\BellSoft" "C:\jdk-21" "C:\jdk-17" "C:\openjdk-21" "C:\openjdk-17" "%~dp0jdk-17""

set "BEST_JAVA_HOME="
set "BEST_VERSION=0"

for %%P in (%SEARCH_PATHS%) do (
    if exist "%%~P" (
        for /d %%D in ("%%~P\*") do (
            if exist "%%D\bin\java.exe" (
                for /f "usebackq tokens=3" %%V in (`""%%D\bin\java.exe" -version 2>&1 | findstr /i "version""`) do (
                    set "VER_STR=%%~V"
                    set "VER_STR=!VER_STR:"=!"
                    for /f "delims=. tokens=1" %%A in ("!VER_STR!") do (
                        set "MAJOR_VER=%%A"
                        if !MAJOR_VER! geq 17 (
                            if !MAJOR_VER! gtr !BEST_VERSION! (
                                set "BEST_VERSION=!MAJOR_VER!"
                                set "BEST_JAVA_HOME=%%D"
                            )
                        )
                    )
                )
            )
        )
    )
)

:: Check the Shutter Encoder fallback if nothing else found
if "!BEST_JAVA_HOME!"=="" (
    if exist "C:\Program Files\Shutter Encoder\JRE\bin\java.exe" (
        set "BEST_JAVA_HOME=C:\Program Files\Shutter Encoder\JRE"
        set "BEST_VERSION=25"
    )
)

if not "!BEST_JAVA_HOME!"=="" (
    echo !BEST_JAVA_HOME!
    exit /b 0
)

exit /b 1
