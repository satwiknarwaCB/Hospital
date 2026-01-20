# Restart the FastAPI backend server
Write-Host "Stopping backend server..." -ForegroundColor Yellow
$process = Get-Process -Id 2720 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id 2720 -Force
    Start-Sleep -Seconds 2
}

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; python main.py"
Write-Host "Backend server restarted!" -ForegroundColor Green
