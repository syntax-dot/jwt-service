FROM node:20-alpine as runner

WORKDIR /app

COPY /dist /app
COPY /.env /app

EXPOSE 3000

CMD [ "node", "index.js" ]
