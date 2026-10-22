FROM node:24-alpine

WORKDIR /app

COPY ./backend ./

RUN npm install

CMD ["node", "server.js"]