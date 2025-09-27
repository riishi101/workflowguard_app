# Single stage build
FROM node:20-slim

# Install OpenSSL to fix Prisma warnings
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Verify that the dist directory exists and has the main.js file
RUN echo "Checking dist directory contents:" && ls -la dist/
RUN echo "Finding main.js file:" && find dist -name "main.js" -type f

# Expose the port the app runs on
EXPOSE 4000

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Set environment variables
ENV RAZORPAY_KEY_ID=rzp_live_R6PjXR1FYupO0Y
ENV RAZORPAY_KEY_SECRET=O5McpwbAgoiSNMJDQetruaTK
ENV RAZORPAY_WEBHOOK_SECRET=Liverpoolisthebest@1998

ENV RAZORPAY_PLAN_ID_STARTER_INR="plan_R6RI02CsUCUlDz"
ENV RAZORPAY_PLAN_ID_PROFESSIONAL_INR="plan_R6RKEg5mqJK6Ky"
ENV RAZORPAY_PLAN_ID_ENTERPRISE_INR="plan_R6RKnjqXu0BZsH"
ENV RAZORPAY_PLAN_ID_STARTER_USD="plan_RBDqWapKHZfPU7"
ENV RAZORPAY_PLAN_ID_PROFESSIONAL_USD="plan_RBDrKWI81HS1FZ"
ENV RAZORPAY_PLAN_ID_ENTERPRISE_USD="plan_RBDrX9dGapWrTe"
ENV RAZORPAY_PLAN_ID_STARTER_GBP="plan_RBFxk81S3ySXxj"
ENV RAZORPAY_PLAN_ID_PROFESSIONAL_GBP="plan_RBFy8LsuW36jIj"
ENV RAZORPAY_PLAN_ID_ENTERPRISE_GBP="plan_RBFyJlB5jxwxB9"
ENV RAZORPAY_PLAN_ID_STARTER_EUR="plan_RBFjbYhAtD3snL"
ENV RAZORPAY_PLAN_ID_PROFESSIONAL_EUR="plan_RBFjqo5wE0d4jz"
ENV RAZORPAY_PLAN_ID_ENTERPRISE_EUR="plan_RBFovOUIUXISBE"
ENV RAZORPAY_PLAN_ID_STARTER_CAD="plan_RBFrtufmxmxwi8"
ENV RAZORPAY_PLAN_ID_PROFESSIONAL_CAD="plan_RBFsD6U2rQb4B6"
ENV RAZORPAY_PLAN_ID_ENTERPRISE_CAD="plan_RBFscXaosRIzEc"

# Start the application
CMD ["node", "--max-old-space-size=400", "dist/main.js"]