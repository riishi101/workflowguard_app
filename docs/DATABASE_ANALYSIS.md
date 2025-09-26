# Database Schema Analysis

## 1. Overview

The database schema is defined using Prisma and is designed to support the core features of the WorkflowGuard application. It uses a PostgreSQL database and includes tables for managing users, workflows, subscriptions, and other application-related data.

## 2. ERD Diagram

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String name
        String password
        String jobTitle
        String timezone
        String language
        DateTime createdAt
        DateTime updatedAt
        String hubspotPortalId UK
        String hubspotAccessToken
        String hubspotRefreshToken
        DateTime hubspotTokenExpiresAt
    }

    Workflow {
        String id PK
        String hubspotId UK
        String name
        String status
        String ownerId FK
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
        Boolean isDeleted
        DateTime restoredAt
    }

    WorkflowVersion {
        String id PK
        String workflowId FK
        Int versionNumber
        String snapshotType
        String createdBy
        DateTime createdAt
        Json data
    }

    AuditLog {
        String id PK
        String userId FK
        String action
        String entityType
        String entityId
        Json oldValue
        Json newValue
        DateTime timestamp
        String ipAddress
    }

    Subscription {
        String id PK
        String userId UK, FK
        String planId
        String status
        DateTime trialEndDate
        DateTime nextBillingDate
        DateTime createdAt
        DateTime updatedAt
        String razorpayCustomerId
        String razorpaySubscriptionId
    }

    Webhook {
        String id PK
        String userId FK
        String name
        String endpointUrl
        String secret
        String events
        DateTime createdAt
        DateTime updatedAt
    }

    Plan {
        String id PK
        String name
        String description
        Float price
        String interval
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
        Json features
    }

    Overage {
        String id PK
        String userId FK
        String planId
        Float amount
        String description
        Boolean isBilled
        DateTime billedAt
        DateTime createdAt
        DateTime updatedAt
    }

    NotificationSettings {
        String id PK
        String userId UK, FK
        Boolean enabled
        String email
        Boolean workflowDeleted
        Boolean enrollmentTriggerModified
        Boolean workflowRolledBack
        Boolean criticalActionModified
        DateTime createdAt
        DateTime updatedAt
    }

    ApiKey {
        String id PK
        String userId FK
        String name
        String description
        String key UK
        Boolean isActive
        DateTime lastUsed
        DateTime createdAt
        DateTime updatedAt
    }

    SsoConfig {
        String id PK
        String provider UK
        String clientId
        String clientSecret
        String redirectUri
        Boolean isEnabled
        DateTime createdAt
        DateTime updatedAt
    }

    SupportTicket {
        String id PK
        String userId FK
        String subject
        String description
        String status
        String priority
        String category
        DateTime createdAt
        DateTime updatedAt
    }

    SupportReply {
        String id PK
        String ticketId FK
        String userId FK
        String message
        Boolean isInternal
        DateTime createdAt
        DateTime updatedAt
    }

    User ||--o{ Workflow : "owns"
    User ||--o{ AuditLog : "performs"
    User ||--o{ Subscription : "has"
    User ||--o{ Webhook : "configures"
    User ||--o{ Overage : "incurs"
    User ||--o{ NotificationSettings : "has"
    User ||--o{ ApiKey : "creates"
    User ||--o{ SupportTicket : "creates"
    User ||--o{ SupportReply : "writes"
    Workflow ||--o{ WorkflowVersion : "has"
    Subscription }|..|| Plan : "subscribes to"
    SupportTicket ||--o{ SupportReply : "has"
```

## 3. Table Descriptions

### `User`
- **Purpose:** Stores user account information, including authentication details and HubSpot integration credentials.
- **Key Columns:**
  - `id`: Unique identifier for the user.
  - `email`: User's email address (unique).
  - `hubspotPortalId`: HubSpot portal ID associated with the user's account.

### `Workflow`
- **Purpose:** Represents a HubSpot workflow being monitored by the application.
- **Key Columns:**
  - `id`: Unique identifier for the workflow.
  - `hubspotId`: The ID of the workflow in HubSpot (unique).
  - `ownerId`: Foreign key linking to the `User` who owns the workflow.

### `WorkflowVersion`
- **Purpose:** Stores snapshots of a workflow at different points in time.
- **Key Columns:**
  - `id`: Unique identifier for the version.
  - `workflowId`: Foreign key linking to the `Workflow`.
  - `versionNumber`: Sequential version number for each workflow.
  - `data`: JSON object containing the workflow snapshot.

### `AuditLog`
- **Purpose:** Tracks significant actions performed by users within the application.
- **Key Columns:**
  - `id`: Unique identifier for the log entry.
  - `userId`: Foreign key linking to the `User` who performed the action.
  - `action`: The action that was performed (e.g., "workflow.create").
  - `newValue`: JSON object representing the state of the entity after the change.

### `Subscription`
- **Purpose:** Manages user subscriptions and billing information.
- **Key Columns:**
  - `id`: Unique identifier for the subscription.
  - `userId`: Foreign key linking to the `User`.
  - `planId`: The ID of the subscription plan.
  - `razorpaySubscriptionId`: The subscription ID from Razorpay.

### `Webhook`
- **Purpose:** Stores configurations for webhooks that send notifications to external services.
- **Key Columns:**
  - `id`: Unique identifier for the webhook.
  - `userId`: Foreign key linking to the `User`.
  - `endpointUrl`: The URL where the webhook payload will be sent.

### `Plan`
- **Purpose:** Defines the available subscription plans.
- **Key Columns:**
  - `id`: Unique identifier for the plan.
  - `name`: The name of the plan (e.g., "Basic", "Pro").
  - `price`: The price of the plan.

### `Overage`
- **Purpose:** Tracks any usage that exceeds the limits of a user's subscription plan.
- **Key Columns:**
  - `id`: Unique identifier for the overage record.
  - `userId`: Foreign key linking to the `User`.
  - `amount`: The overage amount to be billed.

### `NotificationSettings`
- **Purpose:** Stores user preferences for receiving notifications.
- **Key Columns:**
  - `id`: Unique identifier for the settings.
  - `userId`: Foreign key linking to the `User`.
  - `workflowDeleted`: Boolean flag to enable/disable notifications for workflow deletions.

### `ApiKey`
- **Purpose:** Manages API keys for programmatic access to the application.
- **Key Columns:**
  - `id`: Unique identifier for the API key.
  - `userId`: Foreign key linking to the `User`.
  - `key`: The API key string (unique).

### `SsoConfig`
- **Purpose:** Stores configurations for Single Sign-On (SSO) providers.
- **Key Columns:**
  - `id`: Unique identifier for the SSO configuration.
  - `provider`: The SSO provider (e.g., "google", "okta").

### `SupportTicket` & `SupportReply`
- **Purpose:** A simple support ticket system to manage user inquiries.
- **Key Columns:**
  - `SupportTicket`: Stores the main ticket information.
  - `SupportReply`: Stores replies to a support ticket.