FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

COPY yarn.lock ./yarn.lock
COPY package.json ./package.json
COPY apps ./apps

# Install yarn
# RUN npm install -g yarn

RUN ls -lha

# Install dependencies
RUN yarn workspace @yolominds/metadata-service-api install

ENV NODE_ENV production

RUN yarn workspace @yolominds/metadata-service-api run build

FROM node:18-alpine

COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/yarn*.json ./
COPY --from=builder /app/apps/metadata-service-api/build ./build

EXPOSE 3000
CMD [ "node", "build/src/server.js" ]
