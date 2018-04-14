# provide a means of packaging your application as a single deployable artifact which encapsulates its dependencies

I am packaging everything into a container image as the single deployable artifact. The main reason is being that the container technology is cross-platform and is supported by verious different packaging softwares, i.e Docker, Kubernetes, etc.

# Create a pipeline that builds your application on each commit; Travis or similar, for example

There are quite a lot of options for continious integration/deployment in the market at the moment, while the most popular ones such as Trvais, Jenkins, TeamCity, CircleCI, Solano on top of my head.

I chose to use **AWS codePipeline** due to several reasons:

* It is simple to use, and comes with a nice web-basd GUI to configure your deployment
* It can take build artifact from **AWS codeBuild**, and the codeBuild is simple and easy to configure using the config file buildspec.yml
* It is fully supported by AWS cloud technologies such as **EC2**, **ECS**, **ECR**, etc
* Scale up or down is easily done in AWS EC2.
* Security offered by AWS

# write a clear and understandable README which explains your application and its deployment steps

   ## Following technologies are mainly involved/used to implement the application:

   * It uses **NodeJS** as the backend server runtime.
   * It uses **Express** as the backend application framework, i.e routing, etc.
   * **EJS** templates are used for rendering applicable API endpoints.


   ## The application structure is described below:

   * Configuration details and dependencies are specified in the file **package-lock.json** and **package.json**
   * The entry point of the application is in the file **server.js**, and this is where the app initialisation and routing is done
   * The views that are rendered when endpoints are hit are placed within the folder **/views**, in my case there is only one EJS template since the other endpoints are simply returning objects
   * Test scripts are placed within the folder **/test**, I have created some integration tests to ensure desired routing is working and endpoints are responding requests correctly. Note that I have not created any unit tests since I don't have any functions or so defined in my implementation.


   ## Deployment process

   ### Manual deployment

   1. Define the container with Dockerfile. This specifies what dependencies are included and what commadn to run. The file looks like below   in my case:
      ```
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
      ```
   2. Go to the root folder of the application, and build the container image using following command in my case:
      ```
      docker build -t TechnicalTestContainerImage .
      ```
   3. Deploy the web in any container enabled deployment system, i.e AWS ECS, Kubernetes, etc.
