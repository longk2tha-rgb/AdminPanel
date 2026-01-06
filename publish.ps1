# AdminPanel - Publish Script
# Chay file nay de build va publish ban cap nhat len GitHub
# QUAN TRONG: Dat bien moi truong GH_TOKEN truoc khi chay script nay

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Admin Panel - Publish to GitHub      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for GH_TOKEN environment variable
if (-not $env:GH_TOKEN) {
    Write-Host "[ERROR] Chua dat bien moi truong GH_TOKEN!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Huong dan: Chay lenh sau truoc khi publish:" -ForegroundColor Yellow
    Write-Host '  $env:GH_TOKEN = "your_github_token_here"' -ForegroundColor White
    Write-Host ""
    Write-Host "Hoac dat GH_TOKEN trong System Environment Variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Nhan phim bat ky de dong..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Get current version from package.json
$packageJson = Get-Content -Path "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version

Write-Host "[INFO] Version hien tai: $currentVersion" -ForegroundColor Yellow
Write-Host "[INFO] GH_TOKEN da duoc dat." -ForegroundColor Green
Write-Host ""

# Ask if user wants to continue
$confirm = Read-Host "Ban co muon publish version $currentVersion len GitHub? (Y/N)"

if ($confirm -eq "Y" -or $confirm -eq "y") {
    Write-Host ""
    Write-Host "[BUILD] Dang build va publish..." -ForegroundColor Green
    Write-Host ""
    
    # Run build and publish
    npm run dist -- --publish always
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  HOAN THANH! Version $currentVersion da duoc publish" -ForegroundColor Green
    Write-Host "  Link: https://github.com/longk2tha-rgb/AdminPanel/releases" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "[HUY] Da huy publish." -ForegroundColor Red
}

Write-Host ""
Write-Host "Nhan phim bat ky de dong..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
