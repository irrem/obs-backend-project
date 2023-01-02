FROM node:17.4.0
WORKDIR /home/node/dist
COPY test /home/node/dist
RUN npm install
RUN npm install mongodb
CMD npm start

EXPOSE 3000
