FROM node:17.4.0
WORKDIR /home/node/test
COPY node-server /home/node/test
RUN npm install
RUN npm install mongodb
CMD npm run start
EXPOSE 3000
