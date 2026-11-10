FROM node:24-alpine@sha256:a34ab6d7f6f4813f4d0c5469d74685604b962fbdbf5793a7bc7b4998ecb867c8

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .
RUN chown -R node:node /workspace

USER node

CMD ["npm", "run", "verify"]
