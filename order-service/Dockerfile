FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache bash
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

CMD ["/wait-for-it.sh", "mongodb:27017", "--", "/wait-for-it.sh", "rabbitmq:5672", "--", "npm", "run", "start:prod"]