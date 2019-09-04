# => Build container
# https://www.freecodecamp.org/news/how-to-implement-runtime-environment-variables-with-create-react-app-docker-and-nginx-7f9d42a91d70/
FROM node:alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Start Nginx server
CMD ["npm", "run", "start:prod"]