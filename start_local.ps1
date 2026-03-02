# start_local.ps1 — One-click local start script for Fleet Manager (Windows)
#
# Starts:
#   1. FastAPI backend  on http://localhost:7767
#   2. Data generator   (seeds vehicles + simulates movement)
#   3. React frontend   on http://localhost:3000
#
# Usage:
#   cd FleetManagerDemo
#   .\start_local.ps1

$root     = $PSScriptRoot
$venv     = "$root\.venv\Scripts\python.exe"
$backend  = "$root\backend"
$frontend = "$root\frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fleet Manager — Local Dev Startup" -ForegroundColor Cyan
Write-Host "  Backend : http://localhost:7767" -ForegroundColor Cyan
Write-Host "  API Docs: http://localhost:7767/api/docs" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Check virtual environment ──────────────────────────────────────────────
if (-not (Test-Path $venv)) {
    Write-Host "[ERROR] Virtual environment not found at $venv" -ForegroundColor Red
    Write-Host "  Run: python -m venv .venv && .venv\Scripts\pip install -r backend\requirements.txt"
    exit 1
}

# ── Check node_modules ────────────────────────────────────────────────────
if (-not (Test-Path "$frontend\node_modules")) {
    Write-Host "[INFO] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontend
    npm install --legacy-peer-deps | Out-Null
    Pop-Location
}

# ── Check port availability ───────────────────────────────────────────────
function Test-PortInUse {
    param([int]$Port)
    $conn = [System.Net.Sockets.TcpClient]::new()
    try {
        $conn.Connect("127.0.0.1", $Port)
        $conn.Dispose()
        return $true   # port accepted a connection → already in use
    } catch {
        return $false
    }
}

$portsOK = $true
if (Test-PortInUse 7767) {
    Write-Host "[WARN] Port 7767 is already in use. Stop the process occupying it or the backend will fail to start." -ForegroundColor Yellow
    $portsOK = $false
}
if (Test-PortInUse 3000) {
    Write-Host "[WARN] Port 3000 is already in use. The React dev server may fail to start." -ForegroundColor Yellow
    $portsOK = $false
}
if (-not $portsOK) {
    $ans = Read-Host "Continue anyway? [y/N]"
    if ($ans -notmatch '^[Yy]') { exit 1 }
}

# ── Start Backend (new window) ────────────────────────────────────────────
Write-Host "[1/3] Starting backend on port 7767..." -ForegroundColor Green
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "cd '$backend'; & '$venv' -m uvicorn app.main:app --host 127.0.0.1 --port 7767 --reload" `
    -WindowStyle Normal

Start-Sleep 3

# ── Start Data Generator (new window) ────────────────────────────────────
Write-Host "[2/3] Starting data generator..." -ForegroundColor Green
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "cd '$backend'; & '$venv' -m app.generator" `
    -WindowStyle Normal

Start-Sleep 2

# ── Start Frontend (new window) ───────────────────────────────────────────
Write-Host "[3/3] Starting React frontend on port 3000..." -ForegroundColor Green
$env:BROWSER = "none"
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "cd '$frontend'; `$env:BROWSER='none'; npm start" `
    -WindowStyle Normal

Write-Host ""
Write-Host "[OK] All processes started in separate windows." -ForegroundColor Green
Write-Host "     Open http://localhost:3000 in your browser." -ForegroundColor Green
Write-Host ""
