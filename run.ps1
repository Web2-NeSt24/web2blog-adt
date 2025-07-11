Write-Host "Starting web2blog application..." -ForegroundColor Green

Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host "Starting backend..." -ForegroundColor Yellow
Start-Process -FilePath "python" -ArgumentList "manage.py", "runserver" -WindowStyle Normal

Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Starting frontend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "Frontend will be available at http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend will be available at http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Yellow
Read-Host
