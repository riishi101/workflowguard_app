# WorkflowGuard - SSH over HTTP Setup Script (PowerShell)
# This script configures SSH access over port 80 using nginx as a reverse proxy

param(
    [switch]$Force = $false
)

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "=== WorkflowGuard - SSH over HTTP Setup ===" -ForegroundColor $Yellow

# Check if running as administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "This script must be run as Administrator. Please run PowerShell as Administrator." -ForegroundColor $Red
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed. Please install Docker Desktop first." -ForegroundColor $Red
    exit 1
}

# Check if Docker Compose is available
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "Docker Compose is not available. Please ensure Docker Desktop is running." -ForegroundColor $Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners()
        return $listener | Where-Object { $_.Port -eq $Port }
    }
    catch {
        return $false
    }
}

Write-Host "Step 1: Checking system requirements..." -ForegroundColor $Green

# Check if port 80 is available
if (Test-Port -Port 80) {
    Write-Host "Warning: Port 80 is already in use. This may cause conflicts." -ForegroundColor $Yellow
    if (-not $Force) {
        $response = Read-Host "Do you want to continue? (y/N)"
        if ($response -notmatch "^[Yy]$") {
            Write-Host "Setup cancelled." -ForegroundColor $Red
            exit 1
        }
    }
}

Write-Host "Step 2: Stopping existing containers..." -ForegroundColor $Green
try {
    docker-compose -f docker-compose.prod.yml down
} catch {
    Write-Host "No existing containers to stop." -ForegroundColor $Yellow
}

Write-Host "Step 3: Building containers with SSH support..." -ForegroundColor $Green
docker-compose -f docker-compose.prod.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build containers. Check the output above for errors." -ForegroundColor $Red
    exit 1
}

Write-Host "Step 4: Starting services..." -ForegroundColor $Green
docker-compose -f docker-compose.prod.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start services. Check the output above for errors." -ForegroundColor $Red
    exit 1
}

Write-Host "Step 5: Waiting for services to start..." -ForegroundColor $Green
Start-Sleep -Seconds 30

Write-Host "Step 6: Checking service health..." -ForegroundColor $Green
docker-compose -f docker-compose.prod.yml ps

Write-Host "Step 7: Testing connectivity..." -ForegroundColor $Green
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ConnectAsync("localhost", 80).Wait(5000)
    if ($tcpClient.Connected) {
        Write-Host "✓ Port 80 is accessible" -ForegroundColor $Green
        $tcpClient.Close()
    } else {
        Write-Host "✗ Port 80 is not accessible" -ForegroundColor $Red
    }
} catch {
    Write-Host "✗ Port 80 is not accessible" -ForegroundColor $Red
}

Write-Host "Setup complete!" -ForegroundColor $Green
Write-Host "Next steps:" -ForegroundColor $Yellow
Write-Host "1. Update your Hostinger firewall to only allow port 80"
Write-Host "2. Set SSH_PASSWORD and SSH_PUBLIC_KEY in your .env file"
Write-Host "3. Test SSH connection: ssh -p 80 workflowguard@your-domain.com"
Write-Host "4. Refer to SSH_ACCESS_GUIDE.md for detailed instructions"

Write-Host "For troubleshooting, check logs with:" -ForegroundColor $Green
Write-Host "docker logs workflowguard-nginx"
Write-Host "docker logs workflowguard-ssh"
