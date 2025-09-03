# Base image
FROM node:18 AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# Dev image
FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Prod image
FROM base AS prod
RUN npm install --production
COPY . .
CMD ["npm", "start"]
