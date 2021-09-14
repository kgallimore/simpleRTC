FROM node:latest AS node

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8888


CMD [ "node", "index.js" ]
