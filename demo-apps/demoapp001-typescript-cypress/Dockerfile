FROM node:20-bookworm

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test"]
