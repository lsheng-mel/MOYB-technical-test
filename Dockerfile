# user the node of version carbon
FROM node:carbon

# Create app directory
WORKDIR /app

# Install app dependencies, use a wildcard to ensure both package.json and package-lock.json are both copied
COPY package*.json ./

# run the command 'npm install' to install all dependencies that's listed in package.json
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000
CMD ["npm", "start"]