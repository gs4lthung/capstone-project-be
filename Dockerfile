FROM node:20-alpine

WORKDIR /app

ARG SERVICE
ENV service_var=$SERVICE

COPY dist/apps/${SERVICE} ./dist
COPY node_modules ./node_modules
COPY package.json ./

CMD sh -c "node dist/main.js"