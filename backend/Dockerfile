FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with Yarn (more reliable than npm)
RUN corepack enable && \
    yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1 && \
    yarn install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "dist/main.js"]