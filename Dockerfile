FROM node:17.4.0
WORKDIR /home/node/obs
COPY node-server /home/node/obs
RUN npm install
RUN npm install mongodb
RUN npm install jsonwebtoken
RUN npm install dotenv
CMD npm run start
EXPOSE 3000
