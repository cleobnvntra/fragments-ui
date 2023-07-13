# Stage 1: Install dependencies
FROM node:18-alpine@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS dependencies

WORKDIR /app

COPY package*json ./
RUN npm ci

# Stage 2: Build the site
FROM node:18-alpine@sha256:d5b2a7869a4016b1847986ea52098fa404421e44281bb7615a9e3615e07f37fb AS builder

WORKDIR /app

COPY --from=dependencies /app /app
COPY . .

RUN npm run build

# Stage 3: serve the site
FROM nginx:1.24.0-alpine@sha256:5e1ccef1e821253829e415ac1e3eafe46920aab0bf67e0fe8a104c57dbfffdf7 AS deploy

COPY --from=builder /app/dist/ /usr/share/nginx/html

EXPOSE 80
