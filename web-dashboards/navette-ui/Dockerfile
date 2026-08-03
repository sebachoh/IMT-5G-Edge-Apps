FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Update nginx to listen on 8082, or map it in docker-compose
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
