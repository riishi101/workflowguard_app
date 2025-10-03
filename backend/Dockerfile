# Ultra-simple Node.js build - avoiding all complex build chains
FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (dev + prod) to ensure TypeScript compilation works
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client BEFORE TypeScript compilation
RUN npx prisma generate

# Use direct TypeScript compiler - bypass all NestJS build complexity
RUN npx tsc --project tsconfig.json --outDir dist

# Copy any missing files that TypeScript might not handle
RUN cp -r prisma dist/ 2>/dev/null || true

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Simple startup - no complex build chains
CMD ["node", "dist/main.js"]