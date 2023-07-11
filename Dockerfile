# Stage 1: Build stage
FROM node:18-alpine AS dependencies

LABEL maintainer="Cleo Buenaventura <cjbuenaventura@myseneca.ca>"
LABEL description="Fragments-ui"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

CMD npm run serve

EXPOSE 1234
