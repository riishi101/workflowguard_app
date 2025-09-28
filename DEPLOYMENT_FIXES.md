# WorkflowGuard Deployment Fixes

This document summarizes the changes made to fix the deployment issues with the WorkflowGuard application.

## Issues Fixed

1. **"Error: Cannot find module '/app/dist/main.js'"**: The main issue was that the build process was not correctly generating the JavaScript files in the dist folder.

2. **TypeScript decorator compilation issues**: The compiled JavaScript files had issues with decorator compilation that prevented the application from starting.

## Changes Made

### 1. Updated tsconfig.json
- Added proper decorator compilation settings
- Ensured emitDecoratorMetadata and experimentalDecorators are enabled
- Added moduleResolution and other compiler options

### 2. Updated package.json
- Changed the build script from `nest build --webpack` to `tsc -p tsconfig.build.json --outDir dist`
- This ensures proper TypeScript compilation without webpack issues

### 3. Updated Dockerfile
- Modified the build process to use `tsc` directly
- Ensured proper copying of Prisma files to the dist folder
- Simplified the build process to avoid webpack complications

### 4. Verified build process
- Tested the build process locally
- Confirmed that main.js is generated correctly
- Verified that the application can start with `node dist/main.js`

## Deployment Verification

The changes have been tested locally and the application now:
- Compiles correctly with `npm run build`
- Generates the dist folder with all required files
- Starts successfully with `node dist/main.js`
- The Docker build process completes without errors

These fixes should resolve the deployment issues in Google Cloud Run where the container was failing to start due to the missing main.js file.