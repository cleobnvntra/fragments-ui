# Stage 1: Build stage
FROM node:18.16.0 AS dependencies

LABEL maintainer="Cleo Buenaventura <cjbuenaventura@myseneca.ca>"
LABEL description="Fragments-ui"

ENV NODE_ENV=production \
    # Default port
    PORT=5000 \
    # Reduce npm spam when installing within Docker
    NPM_CONFIG_LOGLEVEL=warn \
    # Disable color when run inside Docker
    NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json /app/

RUN npm ci --only=production

FROM node:alpine as builder

WORKDIR /app

COPY --from=dependencies /app /app

COPY ./src ./src

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/build/ /usr/share/nginx/html/

EXPOSE 5000