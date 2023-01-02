FROM node:17.4.0
WORKDIR /home/node/app
COPY test /home/node/app
RUN npm install
CMD npm start

EXPOSE 3000
