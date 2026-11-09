
# Stage 1: Build Angular Application
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# Stage 2: Run Production Application
FROM nginx:alpine

COPY --from=build /app/www/ /usr/share/nginx/html/

# Configure Nginx to listen on port 8100
RUN sed -i 's/listen       80;/listen       8100;/' /etc/nginx/conf.d/default.conf

EXPOSE 8100

CMD ["nginx", "-g", "daemon off;"]
