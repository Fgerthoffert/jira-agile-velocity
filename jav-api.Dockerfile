# => Build container
FROM node:alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Start Nginx server
CMD ["node", "dist/apps/jav-api/main.js"]