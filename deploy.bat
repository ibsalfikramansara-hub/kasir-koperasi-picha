@echo off
setlocal enabledelayedexpansion
title Pusat Kendali Kasir Koperasi Picha v2.0.0
color 0B

:: Deteksi Node.js dan Git
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;!PATH!"
    )
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "PATH=C:\Program Files\Git\cmd;!PATH!"
    )
)

:MENU
cls
echo =============================================================================
echo               PUSAT KENDALI KASIR KOPERASI PICHA v2.0.0
echo               Sistem Kasir dan Inventaris Madrasah (Offline-First)
echo =============================================================================
echo.
echo   [1] Jalankan Server Lokal (http://localhost:8000) dan Buka Browser
echo   [2] Jalankan Automated Unit Test Suite (Pengujian Sistem 100%%)
echo   [3] Unggah / Sinkronisasi ke GitHub dan Vercel (One-Click Deploy)
echo   [4] Backup / Verifikasi Master Data Awal (initial_data.json)
echo   [5] Buka Online Tunnel Cloudflare (Akses Gratis dari HP / Internet)
echo   [0] Keluar
echo.
echo =============================================================================
set "PILIHAN="
set /p PILIHAN=">> Masukkan pilihan Anda [0-5]: "
if not defined PILIHAN goto MENU

if "%PILIHAN%"=="1" goto LOCAL_SERVER
if "%PILIHAN%"=="2" goto RUN_TESTS
if "%PILIHAN%"=="3" goto UPLOAD_GITHUB
if "%PILIHAN%"=="4" goto BACKUP_DATA
if "%PILIHAN%"=="5" goto CLOUDFLARE_TUNNEL
if "%PILIHAN%"=="0" goto KELUAR

echo.
echo [PILIHAN TIDAK VALID] Silakan masukkan angka antara 0 sampai 5.
timeout /t 2 >nul
goto MENU

:LOCAL_SERVER
cls
echo =============================================================================
echo                 MENJALANKAN SERVER LOKAL KASIR PICHA
echo =============================================================================
echo.
echo Membuka browser ke http://localhost:8000/login.html ...
start "" "http://localhost:8000/login.html"
echo.
echo Tekan CTRL + C di jendela ini untuk menghentikan server.
echo.
node test/local_server.js
pause
goto MENU

:RUN_TESTS
cls
echo =============================================================================
echo                 MENJALANKAN AUTOMATED UNIT TEST SUITE
echo =============================================================================
echo.
node test/test_suite.js
echo.
pause
goto MENU

:UPLOAD_GITHUB
cls
call upload_ke_github.bat
goto MENU

:BACKUP_DATA
cls
echo =============================================================================
echo                 BACKUP DAN VERIFIKASI DATA MASTER
echo =============================================================================
echo.
if exist "initial_data.json" (
    echo [OK] File master seed data ditemukan: initial_data.json
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Item initial_data.json | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize"
    echo.
    set /p BKP_NAME=">> Buat salinan cadangan bertanggal sekarang? (Y/T): "
    if /i "!BKP_NAME!"=="Y" (
        set "BKP_FILE=initial_data_backup_%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%.json"
        set "BKP_FILE=!BKP_FILE: =0!"
        copy initial_data.json "!BKP_FILE!" >nul
        echo [SUKSES] Cadangan disimpan sebagai: !BKP_FILE!
    )
) else (
    echo [ERROR] initial_data.json tidak ditemukan!
)
echo.
pause
goto MENU

:CLOUDFLARE_TUNNEL
cls
call online_tunnel.bat
goto MENU

:KELUAR
cls
echo Terima kasih telah menggunakan Kasir Koperasi Picha.
timeout /t 1 >nul
exit /b 0
