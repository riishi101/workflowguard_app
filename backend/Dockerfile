FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install dependencies and build
RUN npm ci

COPY . .
# Generate Prisma client and build the application
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Run production build
CMD ["npm", "run", "start:prod"]