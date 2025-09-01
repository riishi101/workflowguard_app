# Update frontend .env file to use correct API domain
$envFile = "frontend\.env"
$content = Get-Content $envFile
$updatedContent = $content -replace 'api\.workflowguard\.pro', 'www.workflowguard.pro'
$updatedContent | Set-Content $envFile

Write-Host "Updated $envFile with correct API domain"
Write-Host "Contents:"
Get-Content $envFile
