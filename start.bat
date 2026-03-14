@echo off
chcp 65001 >nul
title 브링엔지니어링 경영관리 시스템
echo.
echo   ========================================
echo     브링엔지니어링 경영관리 시스템 시작
echo   ========================================
echo.

cd /d "%~dp0"

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo   [오류] Node.js가 설치되어 있지 않습니다.
    echo   https://nodejs.org 에서 설치해주세요.
    pause
    exit /b
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo   의존성 설치 중...
    call npm install
    echo.
)

:: Start server and open browser
echo   서버를 시작합니다...
start "" http://localhost:3000
node server.js
