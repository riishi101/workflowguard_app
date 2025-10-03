# Production-ready multi-stage build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application with tsc
RUN npm run build

# Copy prisma files to dist
RUN mkdir -p dist/prisma && cp prisma/schema.prisma dist/prisma/ && cp -r prisma/migrations dist/prisma/

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Install curl for health checks and other tools
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy generated Prisma client from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy prisma files
COPY --from=builder /app/prisma ./prisma

# Copy environment files
COPY --from=builder /app/.env* ./

# Expose the port the app runs on
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the application with Prisma setup
CMD ["sh", "-c", "npx prisma generate && node --max-old-space-size=400 dist/main.js"]