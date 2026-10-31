
FROM node:24-alpine

WORKDIR /app

RUN npm install -g @ionic/cli

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8100

CMD ["ionic", "serve", "--host=0.0.0.0", "--port=8100", "--no-open"]
