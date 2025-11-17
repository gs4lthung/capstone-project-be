############################################
# Build stage
############################################
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install build-time dependencies (dev + prod)
# Copy package manifests first to leverage layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build the monorepo (builds all libs/apps per nest config)
COPY . .
RUN npm run build

############################################
# Production stage
############################################
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Install FFmpeg and ffprobe (required for video processing)
RUN apk add --no-cache ffmpeg

# Only install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder and set ownership to non-root user
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

# Create required directories for file uploads with proper permissions
# These directories are used by FileUtils.fileStorage for multer uploads
RUN mkdir -p uploads/users uploads/videos uploads/icons uploads/subjects/images && \
    chown -R node:node uploads

# Default environment variables the app reads via ConfigService
ENV NODE_ENV=production
ENV API_GATEWAY_PORT=8386
ENV API_GATEWAY_HOST=0.0.0.0

# Expose the default api-gateway port (matches ConfigService default)
EXPOSE 8386

# Use the non-root node user provided by the base image
USER node

# Run the API gateway directly
CMD ["node", "dist/apps/api-gateway/src/main"]