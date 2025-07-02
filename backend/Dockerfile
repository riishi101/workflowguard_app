FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start:prod"] 