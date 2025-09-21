-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS workflowguard;

-- Connect to the database
\c workflowguard;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";