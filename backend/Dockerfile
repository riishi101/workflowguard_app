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

# Debug: List files in dist directory
RUN ls -la dist/
RUN find dist -name "*.js" | head -10

# Copy prisma files to dist (SQLite doesn't need migrations)
RUN mkdir -p dist/prisma && cp prisma/schema.prisma dist/prisma/ && cp prisma/schema-sqlite.prisma dist/prisma/

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist* ./dist/

# Create SQLite database file if it doesn't exist
RUN touch dev.db && chmod 666 dev.db

# Debug: List files in dist directory
RUN ls -la dist/
RUN find dist -name "*.js" | head -10

# Copy prisma files
COPY --from=builder /app/prisma ./prisma

# Copy environment files and SQLite database
COPY --from=builder /app/.env* ./
COPY --from=builder /app/dev.db* ./

# Expose the port the app runs on
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start the application
CMD ["node", "--max-old-space-size=400", "dist/main.js"]