FROM node:20.8 as base

WORKDIR /var/www/app

COPY ./package*.json ./

RUN npm i

COPY  . .

RUN npm run build

FROM node:20.8 as production

ARG NODE_ENV=production

ENV NODE_PATH=./dist

WORKDIR /var/www/app

COPY ./package*.json ./

RUN npm install --only=production

COPY --from=base /var/www/app/dist ./dist

CMD ["node", "dist/index.js"]