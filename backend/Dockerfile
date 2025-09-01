FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including dev dependencies for ts-node)
RUN npm ci

COPY . .
# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

# Use ts-node to run directly from TypeScript source
CMD ["npm", "run", "start:dev"]