@echo off
setlocal enabledelayedexpansion
title Kasir Koperasi Picha - Upload Otomatis ke GitHub dan Vercel
color 0B

echo =============================================================================
echo       KASIR KOPERASI PICHA - ONE-CLICK GITHUB DAN VERCEL DEPLOYMENT
echo =============================================================================
echo.

:: 1. Deteksi path Git otomatis
set "GIT_CMD=git"
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
        set "PATH=C:\Program Files\Git\cmd;!PATH!"
    ) else if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
        set "GIT_CMD=C:\Program Files (x86)\Git\cmd\git.exe"
        set "PATH=C:\Program Files (x86)\Git\cmd;!PATH!"
    ) else if exist "%LOCALAPPDATA%\Programs\Git\cmd\git.exe" (
        set "GIT_CMD=%LOCALAPPDATA%\Programs\Git\cmd\git.exe"
        set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;!PATH!"
    ) else if exist "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe" (
        set "GIT_CMD=%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe"
        set "PATH=%USERPROFILE%\AppData\Local\Programs\Git\cmd;!PATH!"
    ) else (
        color 0C
        echo [ERROR] Git belum terdeteksi di komputer ini.
        echo.
        echo Silakan unduh dan pasang Git Windows dari: https://git-scm.com/download/win
        echo (Pilih: 64-bit Git for Windows Setup)
        echo.
        echo Membuka link download Git di browser...
        start "" "https://git-scm.com/download/win"
        echo.
        pause
        exit /b 1
    )
)

echo [OK] Git terdeteksi di sistem.
echo.

:: 2. Jalankan Automated Test Suite Terlebih Dahulu
echo [1/5] Menjalankan automated unit test suite...
where node >nul 2>nul
if %errorlevel% equ 0 (
    node test/test_suite.js
    if !errorlevel! neq 0 (
        color 0C
        echo.
        echo [ERROR] Test suite gagal! Perbaiki error sebelum push ke repository.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Seluruh test suite lulus 100%%!
) else (
    echo [SKIP] Node.js tidak ada di PATH, melewati test suite lokal.
)
echo.

:: 3. Inisialisasi Git Repository jika belum ada
echo [2/5] Memeriksa status Git repository lokal...
"%GIT_CMD%" rev-parse --is-inside-work-tree >nul 2>nul
if %errorlevel% neq 0 (
    echo Menginisialisasi Git repository baru...
    "%GIT_CMD%" init
    "%GIT_CMD%" branch -M main
) else (
    "%GIT_CMD%" branch -M main >nul 2>nul
)

:: Pastikan identitas commit tersedia (mencegah error Author identity unknown)
"%GIT_CMD%" config user.name >nul 2>nul
if %errorlevel% neq 0 "%GIT_CMD%" config user.name "Kasir Picha"
"%GIT_CMD%" config user.email >nul 2>nul
if %errorlevel% neq 0 "%GIT_CMD%" config user.email "admin@picha.id"

:: 4. Cek Remote Repository (GitHub)
echo [3/5] Memeriksa remote origin GitHub...
"%GIT_CMD%" remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [PERHATIAN] Remote repository GitHub belum dihubungkan.
    echo Silakan buat repository baru di: https://github.com/new
    echo Contoh URL: https://github.com/USERNAME/kasir-koperasi-picha.git
    echo.
    set /p REPO_URL=">> Masukkan URL repository GitHub Anda: "
    if not "!REPO_URL!"=="" (
        "%GIT_CMD%" remote add origin !REPO_URL!
        echo [OK] Remote origin berhasil ditambahkan.
    ) else (
        echo [BATAL] URL repository tidak boleh kosong.
        pause
        exit /b 1
    )
)

:: 5. Git Add dan Commit Otomatis
echo.
echo [4/5] Menyiapkan berkas dan membuat commit otomatis...
"%GIT_CMD%" add -A

set "CURR_DATE=%date%"
set "CURR_TIME=%time%"
"%GIT_CMD%" commit -m "Auto-deploy Kasir Koperasi Picha [%CURR_DATE% %CURR_TIME%]" >nul 2>nul

:: 6. Push ke Branch Main
echo.
echo [5/5] Mengunggah perubahan ke GitHub branch 'main'...
echo [INFO] Jika muncul jendela login browser, silakan klik 'Sign in with your browser'.
echo.
"%GIT_CMD%" push -u origin main
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo =============================================================================
    echo    BERHASIL DIUNGGAH KE GITHUB!
    echo =============================================================================
    echo Vercel akan otomatis mendeteksi perubahan ini dan men-deploy versi terbaru
    echo aplikasi Anda dalam hitungan detik (100%% Gratis Selamanya).
    echo.
    echo Cek status deploy Vercel Anda di: https://vercel.com/dashboard
    echo =============================================================================
) else (
    color 0E
    echo.
    echo [INFO] Jika ini push pertama kali dan repository GitHub sudah ada file README,
    echo jalankan sinkronisasi dengan perintah berikut:
    echo     git pull origin main --rebase
    echo     git push -u origin main
)

echo.
pause
