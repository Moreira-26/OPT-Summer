FROM node:18.16.1

WORKDIR /usr/src/backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

RUN npm install -g nodemon

CMD ["npm", "start"]

