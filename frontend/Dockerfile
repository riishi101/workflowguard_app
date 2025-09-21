FROM node:20-slim as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with Yarn (more reliable than npm)
RUN corepack enable && \
    yarn config set registry https://registry.npmjs.org/ && \
    yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 1 && \
    yarn install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]