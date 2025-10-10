# Ultra-simple Node.js build - avoiding all complex build chains
FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies using npm install (more compatible than npm ci)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build using NestJS build system (more reliable than direct tsc)
RUN npm run build

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Simple startup - no complex build chains
CMD ["node", "dist/main.js"]