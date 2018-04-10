FROM node:carbon

# Create app directory
WORKDIR /app

# Install app dependencies, use a wildcard to ensure both package.json and package-lock.json are both copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]