############################################
# Build stage
############################################
FROM node:20 AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

############################################
# Production stage
############################################
FROM node:20 AS runner
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y ffmpeg

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

RUN mkdir -p uploads/users uploads/videos uploads/icons uploads/subjects/images && \
    chown -R node:node uploads
    
RUN mkdir -p /usr/src/app/temp && chown -R node:node /usr/src/app/temp

ENV NODE_ENV=production
ENV API_GATEWAY_PORT=8386
ENV API_GATEWAY_HOST=0.0.0.0

EXPOSE 8386

USER node

CMD ["node", "dist/apps/api-gateway/apps/api-gateway/src/main.js"]
