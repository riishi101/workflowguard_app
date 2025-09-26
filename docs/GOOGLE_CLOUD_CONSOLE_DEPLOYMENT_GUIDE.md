# Step-by-Step Guide to Deploying on Google Cloud Run using the Console

This guide provides instructions for deploying the WorkflowGuard application to Google Cloud Run using the Google Cloud Console.

### Prerequisites

Before you begin, ensure you have the following:

1.  **Google Cloud Platform (GCP) Project:**
    *   Create a new GCP project or use an existing one.
    *   Make sure **billing is enabled** for the project.

2.  **Required APIs:**
    *   Enable the necessary APIs for your project. You can do this from the Cloud Console by navigating to "APIs & Services" > "Library" and enabling:
        *   Cloud Run API
        *   Cloud Build API
        *   Container Registry API
        *   Secret Manager API

3.  **PostgreSQL Database:**
    *   Set up a PostgreSQL database. [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres/create-instance) is a recommended option.
    *   Keep the database connection string (URL) handy.

4.  **Application Code:**
    *   Have the application code available on your local machine or in a Git repository.

### Deployment Steps

#### Step 1: Configure Environment Variables as Secrets

1.  Navigate to **Secret Manager** in the Google Cloud Console.
2.  Create secrets for the following variables:
    *   `DATABASE_URL`
    *   `JWT_SECRET`
    *   `HUBSPOT_CLIENT_ID`
    *   `HUBSPOT_CLIENT_SECRET`
    *   `RAZORPAY_KEY_ID`
    *   `RAZORPAY_KEY_SECRET`
    *   `TWILIO_ACCOUNT_SID`
    *   `TWILIO_AUTH_TOKEN`
    *   `TWILIO_PHONE_NUMBER`

#### Step 2: Build Docker Images with Cloud Build

1.  Navigate to **Cloud Build** in the Google Cloud Console.
2.  Click **"Create Trigger"**.
3.  Connect your source code repository (e.g., GitHub, Bitbucket).
4.  Configure the trigger to use the `cloudbuild.yaml` file from your repository.
5.  Run the trigger manually to build the Docker images. This will create `workflowguard-frontend` and `workflowguard-backend` images in the Container Registry.

#### Step 3: Deploy the Backend Service

1.  Navigate to **Cloud Run** in the Google Cloud Console.
2.  Click **"Create Service"**.
3.  Select the `workflowguard-backend` image from the Container Registry.
4.  Configure the service:
    *   **Service Name:** `workflowguard-backend`
    *   **Region:** Choose your preferred region (e.g., `us-central1`).
    *   **Authentication:** Select "Allow unauthenticated invocations" for now. You can secure it later.
5.  Under the **"Variables & Secrets"** tab, add references to the secrets you created in Step 1.
6.  Click **"Create"** to deploy the service.

#### Step 4: Deploy the Frontend Service

1.  Follow the same steps as for the backend, but select the `workflowguard-frontend` image.
2.  Configure the service:
    *   **Service Name:** `workflowguard-frontend`
    *   **Region:** Use the same region as the backend.
    *   **Authentication:** Select "Allow unauthenticated invocations".
3.  The frontend doesn't require secrets, so you can skip that step.
4.  Click **"Create"** to deploy the service.

#### Step 5: Verify the Deployment

1.  Once the services are deployed, you will get a URL for each.
2.  Visit the frontend URL in your browser to ensure the application is running correctly.

This manual process is useful for understanding the deployment steps, but for regular updates, it's recommended to use the automated `gcloud builds submit` command.