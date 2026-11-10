@echo off
setlocal enabledelayedexpansion
title Kasir Koperasi Picha - Cloudflare Online Tunnel (Instant Free Public URL)
color 0B

echo =============================================================================
echo   KASIR KOPERASI PICHA - CLOUDFLARE ONLINE TUNNEL (100%% GRATIS)
echo =============================================================================
echo Skrip ini akan membuat tautan internet publik (*.trycloudflare.com)
echo agar aplikasi kasir lokal dapat diakses langsung dari HP atau luar jaringan.
echo =============================================================================
echo.

:: 1. Cek Node.js dan Jalankan Server Lokal jika belum aktif
echo [1/3] Memeriksa server lokal Kasir Picha...
netstat -ano | findstr :8000 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Menyalakan server lokal Node.js pada port 8000...
    start /B node test/local_server.js >nul 2>nul
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Server lokal port 8000 sudah aktif.
)

:: 2. Cek binary Cloudflared
echo [2/3] Memeriksa binary Cloudflare Tunnel (cloudflared)...
if not exist "cloudflared.exe" (
    where cloudflared >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] cloudflared.exe belum ditemukan.
        echo Mengunduh cloudflared.exe resmi dari Cloudflare (hanya 1x)...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe', 'cloudflared.exe')"
        if exist "cloudflared.exe" (
            echo [OK] Unduhan cloudflared selesai!
        ) else (
            color 0C
            echo [ERROR] Gagal mengunduh cloudflared.exe. Pastikan koneksi internet aktif.
            pause
            exit /b 1
        )
    )
)

:: 3. Jalankan Cloudflare Quick Tunnel
echo.
echo [3/3] Menghubungkan tunnel ke internet...
echo -----------------------------------------------------------------------------
echo Perhatikan baris URL yang diakhiri dengan .trycloudflare.com di bawah ini!
echo Bagikan URL tersebut ke HP / pengguna kasir untuk mengakses langsung.
echo Tekan CTRL + C untuk menghentikan tunnel kapan saja.
echo -----------------------------------------------------------------------------
echo.

if exist "cloudflared.exe" (
    .\cloudflared.exe tunnel --url http://localhost:8000
) else (
    cloudflared tunnel --url http://localhost:8000
)

pause
