# Manual Deployment Guide

This guide outlines the steps to manually deploy the WorkflowGuard application to the production server.

## Prerequisites

- SSH access to the server: `root@72.60.64.89`
- The application code must be cloned in `/root/workflowguard_app` on the server.

## Deployment Steps

1.  **Connect to the server via SSH:**
    ```bash
    ssh root@72.60.64.89
    ```

2.  **Navigate to the application directory:**
    ```bash
    cd /root/workflowguard_app
    ```

3.  **Pull the latest changes from the `main` branch:**
    ```bash
    git pull origin main
    ```

4.  **Rebuild and restart the Docker containers:**
    This command will stop the current containers, rebuild the images, and start them in detached mode.
    ```bash
    docker-compose down && docker-compose up --build -d
    ```

## Post-Deployment Checks

1.  **Check the status of the running containers:**
    ```bash
    docker-compose ps
    ```

2.  **View the logs for the `nginx` service to ensure it started correctly:**
    ```bash
    docker-compose logs nginx
    ```

## Live Log Tailing

To monitor the application logs in real-time, use the following commands:

-   **Backend logs:**
    ```bash
    docker-compose logs -f backend
    ```

-   **Frontend logs:**
    ```bash
    docker-compose logs -f frontend
    ```

## Other Useful Commands

-   **Stop all services:**
    ```bash
    docker-compose down
    ```

-   **Restart services without rebuilding:**
    ```bash
    docker-compose up -d
    ```
