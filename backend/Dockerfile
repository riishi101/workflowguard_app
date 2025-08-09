FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including dev dependencies needed for build)
RUN npm ci

COPY . .
# Generate Prisma client
RUN npx prisma generate
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

EXPOSE 4000

CMD ["npm", "run", "start:prod"] 