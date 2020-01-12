FROM node:10 AS base

WORKDIR /opt/

COPY package.json /opt/package.json

COPY package-lock.json /opt/package-lock.json

RUN npm i --production

COPY ./ /opt/

CMD npm run start
