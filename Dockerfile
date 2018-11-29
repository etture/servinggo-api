FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Install the app dependencies
COPY package.json package-lock.json .

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3012

CMD ["npm", "start"]