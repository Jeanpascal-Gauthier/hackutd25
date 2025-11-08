# Cleanup script to remove data-driver folder
# Run this script when no processes are using the data-driver folder
# Usage: .\cleanup-data-driver.ps1

Write-Host "Attempting to remove frontend/data-driver folder..." -ForegroundColor Yellow

$dataDriverPath = "frontend\data-driver"

if (Test-Path $dataDriverPath) {
    Write-Host "Found data-driver folder. Attempting removal..." -ForegroundColor Yellow
    
    # Try to remove node_modules first with a delay
    $nodeModulesPath = Join-Path $dataDriverPath "node_modules"
    if (Test-Path $nodeModulesPath) {
        Write-Host "Removing node_modules (this may take a moment)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove the entire folder
    Start-Sleep -Seconds 1
    Remove-Item -Path $dataDriverPath -Recurse -Force -ErrorAction SilentlyContinue
    
    if (Test-Path $dataDriverPath) {
        Write-Host "`nERROR: Could not fully remove data-driver folder." -ForegroundColor Red
        Write-Host "Some files may be locked. Please:" -ForegroundColor Yellow
        Write-Host "  1. Close any running Next.js dev servers" -ForegroundColor Yellow
        Write-Host "  2. Close any file explorers or IDEs with the folder open" -ForegroundColor Yellow
        Write-Host "  3. Restart your computer if needed" -ForegroundColor Yellow
        Write-Host "  4. Run this script again" -ForegroundColor Yellow
        Write-Host "`nOr manually delete the folder: $((Get-Location).Path)\$dataDriverPath" -ForegroundColor Cyan
    } else {
        Write-Host "`nSUCCESS: data-driver folder has been removed!" -ForegroundColor Green
    }
} else {
    Write-Host "data-driver folder not found. Already cleaned up!" -ForegroundColor Green
}

