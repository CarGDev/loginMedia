FROM node:12
WORKDIR /index
COPY package.json /index
RUN npm install
COPY . /index
CMD ["npm", "start"]
