# => Build container
# https://www.freecodecamp.org/news/how-to-implement-runtime-environment-variables-with-create-react-app-docker-and-nginx-7f9d42a91d70/

FROM node:alpine as builder

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

RUN npm run build

# => Run container
FROM nginx:1.15.2-alpine

# Nginx config
RUN rm -rf /etc/nginx/conf.d
COPY ./apps/jav-ui/conf /etc/nginx

# Static build
COPY /dist/apps/jav-ui /usr/share/nginx/html/
COPY ./apps/jav-ui/env.sh /usr/share/nginx/html/
COPY ./apps/jav-ui/.env /usr/share/nginx/html/

# Default port exposure
EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html

# Add bash
RUN apk add --no-cache bash

# Make our shell script executable
RUN chmod +x env.sh

# Start Nginx server
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && cp /usr/share/nginx/html/env-config.js /usr/share/nginx/html/assets/ && nginx -g \"daemon off;\""]
