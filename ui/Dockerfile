# Build project
FROM node:alpine as builder

WORKDIR /usr/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve bundle
FROM nginx:alpine

COPY --from=builder /usr/app/config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /usr/app/build /usr/share/nginx/html