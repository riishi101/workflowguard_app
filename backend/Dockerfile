# Simplified Node.js build for debugging
FROM node:20-slim

WORKDIR /app

# Install system dependencies including build tools for esbuild
RUN apt-get update && apt-get install -y \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Debug: Show package.json content
RUN echo "=== PACKAGE.JSON CONTENT ===" && cat package.json

# Install dependencies with verbose output
RUN npm install --verbose

# Copy source code
COPY . .

# Debug: Show directory structure
RUN echo "=== DIRECTORY STRUCTURE ===" && ls -la src/

# Generate Prisma client with debugging
RUN echo "=== GENERATING PRISMA CLIENT ===" && npx prisma generate

# Debug: Check TypeScript compilation first
RUN echo "=== CHECKING TYPESCRIPT COMPILATION ===" && npx tsc --noEmit --project tsconfig.json

# Build using NestJS build system with maximum memory and debugging
RUN echo "=== STARTING NESTJS BUILD ===" && NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Simple startup - no complex build chains
CMD ["node", "dist/main.js"]