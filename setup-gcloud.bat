@echo off
echo ===============================================
echo WorkflowGuard - Google Cloud CLI Setup Script
echo ===============================================
echo.

echo Step 1: Checking if gcloud is installed...
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI not found. Please install it first from:
    echo https://cloud.google.com/sdk/docs/install
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo ✅ gcloud CLI is installed!
echo.

echo Step 2: Setting up your project...
gcloud config set project continual-mind-473007-h8
echo ✅ Project set to: continual-mind-473007-h8
echo.

echo Step 3: Setting default region...
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
gcloud config set run/region us-central1
echo ✅ Default region set to: us-central1
echo.

echo Step 4: Enabling required APIs...
echo Enabling Cloud Build API...
gcloud services enable cloudbuild.googleapis.com

echo Enabling Artifact Registry API...
gcloud services enable artifactregistry.googleapis.com

echo Enabling Cloud Run API...
gcloud services enable run.googleapis.com

echo ✅ APIs enabled successfully!
echo.

echo Step 5: Creating Artifact Registry repository...
gcloud artifacts repositories create workflowguard-containers --repository-format=docker --location=us-central1 --description="WorkflowGuard containers" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Artifact Registry repository created!
) else (
    echo ℹ️  Artifact Registry repository already exists or creation failed
)
echo.

echo Step 6: Configuring Docker authentication...
gcloud auth configure-docker us-central1-docker.pkg.dev
echo ✅ Docker authentication configured!
echo.

echo ===============================================
echo 🎉 Setup Complete! 
echo ===============================================
echo.
echo Your Google Cloud environment is ready for WorkflowGuard deployment!
echo.
echo Next steps:
echo 1. Navigate to your project directory: cd /d D:\workflowguard_app
echo 2. Run the deployment: gcloud builds submit --config=cloudbuild.yaml
echo.
pause