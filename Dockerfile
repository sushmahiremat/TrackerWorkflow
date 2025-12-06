# Multi-stage build for React + Vite frontend

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Build the application
# Environment variables will be injected at build time
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_HUGGINGFACE_API_KEY

# Set environment variables BEFORE copying source
# This ensures they're available during npm run build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_HUGGINGFACE_API_KEY=$VITE_HUGGINGFACE_API_KEY

# Debug: Print environment variables (will show in build logs)
RUN echo "🔍 VITE_API_BASE_URL=${VITE_API_BASE_URL}"
RUN echo "🔍 VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}"
RUN echo "🔍 VITE_HUGGINGFACE_API_KEY=${VITE_HUGGINGFACE_API_KEY}"

# Copy application source (after setting ENV vars)
COPY . .

# Build the application (Vite will use the ENV vars set above)
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

