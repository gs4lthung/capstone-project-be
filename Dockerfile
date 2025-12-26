############################################
# Build stage
############################################
FROM node:20 AS builder
WORKDIR /usr/src/app

# Install build tools for native addons
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

############################################
# Production stage
############################################
FROM node:20 AS runner
WORKDIR /usr/src/app

# Install build tools + ffmpeg (keep for rebuild)
RUN apt-get update && apt-get install -y python3 make g++ ffmpeg && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --only=production

# Rebuild as root BEFORE switching user (critical fix)
RUN npm rebuild @tensorflow/tfjs-node --build-addon-from-source

COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

RUN mkdir -p uploads/users uploads/videos uploads/icons \
    uploads/subjects/images uploads/credentials/images \
    uploads/base_credentials/images uploads/courses/images && \
    chown -R node:node uploads
    
RUN mkdir -p /usr/src/app/temp && chown -R node:node /usr/src/app/temp

ENV NODE_ENV=production
ENV API_GATEWAY_PORT=8386
ENV API_GATEWAY_HOST=0.0.0.0

EXPOSE 8386

USER node

CMD ["node", "dist/apps/api-gateway/apps/api-gateway/src/main.js"]
