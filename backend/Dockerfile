# Base image
FROM node:18 AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# Dev image
FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Test image (includes devDependencies for testing)
FROM base AS test
RUN npm install
COPY . .
CMD ["npm", "test"]

# Prod image
FROM base AS prod
RUN npm install --production
COPY . .
CMD ["npm", "start"]
