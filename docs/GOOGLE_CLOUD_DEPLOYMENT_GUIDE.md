# Step-by-Step Guide to Deploying on Google Cloud Run

This guide provides instructions for deploying the WorkflowGuard application to Google Cloud Run using the existing Google Cloud Build configuration.

### Prerequisites

Before you begin, ensure you have the following:

1.  **Google Cloud Platform (GCP) Project:**
    *   Create a new GCP project or use an existing one.
    *   Make sure **billing is enabled** for the project.

2.  **`gcloud` CLI:**
    *   [Install and initialize the Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
    *   Authenticate with your GCP account:
        ```bash
        gcloud auth login
        ```
    *   Set your project context:
        ```bash
        gcloud config set project YOUR_PROJECT_ID
        ```
        (Replace `YOUR_PROJECT_ID` with your actual GCP Project ID).

3.  **Required APIs:**
    *   Enable the necessary APIs for your project. You can do this from the command line:
        ```bash
        gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com secretmanager.googleapis.com
        ```

4.  **PostgreSQL Database:**
    *   Set up a PostgreSQL database. [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres/create-instance) is a recommended option.
    *   Keep the database connection string (URL) handy. It should look something like this: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`.

### Deployment Steps

#### Step 1: Configure Environment Variables as Secrets

Your application requires several secret keys and connection strings. It's best practice to store these in [Google Secret Manager](https://cloud.google.com/secret-manager).

Create secrets for the following variables:

*   `DATABASE_URL`: The connection string for your PostgreSQL database.
*   `JWT_SECRET`: A long, random string for signing JWTs.
*   `HUBSPOT_CLIENT_ID`: Your HubSpot app's client ID.
*   `HUBSPOT_CLIENT_SECRET`: Your HubSpot app's client secret.
*   `RAZORPAY_KEY_ID`: Your Razorpay key ID.
*   `RAZORPAY_KEY_SECRET`: Your Razorpay key secret.
*   `TWILIO_ACCOUNT_SID`: Your Twilio account SID.
*   `TWILIO_AUTH_TOKEN`: Your Twilio auth token.
*   `TWILIO_PHONE_NUMBER`: Your Twilio phone number.

You can create a secret using the `gcloud` CLI:
```bash
gcloud secrets create my-secret --replication-policy="automatic"
gcloud secrets versions add my-secret --data-file="/path/to/secret.txt"
```

#### Step 2: Update `cloudbuild.yaml` with Secrets

The [`cloudbuild.yaml`](cloudbuild.yaml:1) file needs to be updated to grant the Cloud Run services access to the secrets you created.

Add a `secretEnv` section to the deployment steps for the backend service:

```yaml
# Deploy Backend to Cloud Run
- name: 'gcr.io/cloud-builders/gcloud'
  args:
    - 'run'
    - 'deploy'
    - 'workflowguard-backend'
    # ... other args
    - '--set-secrets=DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest' # Add other secrets here
```

#### Step 3: Trigger the Deployment

Once the prerequisites are met and the configuration is in place, you can trigger a build. The `cloudbuild.yaml` is set up to automatically build the Docker images, push them to Google Container Registry, and deploy to Cloud Run.

To start the deployment, run the following command from the root of the project:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

This command will:
1.  Submit the current directory's code to Google Cloud Build.
2.  Execute the steps defined in [`cloudbuild.yaml`](cloudbuild.yaml:1).
3.  Build the frontend and backend Docker images.
4.  Push the images to Google Container Registry.
5.  Deploy the new versions to Google Cloud Run.

You can monitor the build progress in the [Google Cloud Console](https://console.cloud.google.com/cloud-build).

#### Step 4: Verify the Deployment

Once the build is complete, you can find the URLs for your frontend and backend services in the Cloud Run section of the Google Cloud Console.

*   The **frontend service** will be publicly accessible.
*   The **backend service** should be configured to only accept requests from the frontend service for security.

Visit the frontend URL in your browser to ensure the application is running correctly.
