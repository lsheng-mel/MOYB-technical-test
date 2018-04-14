# provide a means of packaging your application as a single deployable artifact which encapsulates its dependencies

I am packaging everything into a container image as the single deployable artifact. The main reason is being that the container technology is cross-platform and is supported by verious different packaging softwares, i.e Docker, Kubernetes, etc.

# Create a pipeline that builds your application on each commit; Travis or similar, for example

There are quite a lot of options for continious integration/deployment in the market at the moment, some of the most popular ones are Trvais, Jenkins, TeamCity, CircleCI, Solano, etc.

I chose to use **AWS codePipeline** due to several reasons:

* It is simple to use, and comes with a nice web-basd GUI to configure your deployment
* It can take build artifact from **AWS CodeBuild**, and the CodeBuild is simple and easy to configure using the config file buildspec.yml
* It is fully supported by AWS services such as **EC2**, **ECS**, **ECR**, etc
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
   ---

   1. Define the container with Dockerfile. This specifies what dependencies are included and what command to run. The file looks like below   in my case:
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

   ### Automatic deployment
   ---

   1. Create a GitHub repository to hold my codebase, and this is where my CI system will pull all sources from.
   2. Make sure the docker configuration **Dockerfile** is included in the git repository(the content of **Dockerfile** is the same to the manual deployment process above).
   3. Create a **Amazon ECR** as the repositoy of all my container images.
   4. Create an **Amazon ECS** task defition that references the Docker image hosted in **AWS ECR**. My task definition (in JSON format) looks like below:
      ```
      {
		  "executionRoleArn": null,
		  "containerDefinitions": [
		    {
		      "dnsSearchDomains": null,
		      "logConfiguration": null,
		      "entryPoint": [],
		      "portMappings": [
		        {
		          "hostPort": 4000,
		          "protocol": "tcp",
		          "containerPort": 3000
		        }
		      ],
		      "command": [],
		      "linuxParameters": null,
		      "cpu": 10,
		      "environment": [],
		      "ulimits": null,
		      "dnsServers": null,
		      "mountPoints": [],
		      "workingDirectory": null,
		      "dockerSecurityOptions": null,
		      "memory": 300,
		      "memoryReservation": null,
		      "volumesFrom": [],
		      "image": "708541441402.dkr.ecr.ap-southeast-1.amazonaws.com/lsheng-container-repository:latest",
		      "disableNetworking": null,
		      "healthCheck": null,
		      "essential": true,
		      "links": [],
		      "hostname": null,
		      "extraHosts": null,
		      "user": null,
		      "readonlyRootFilesystem": null,
		      "dockerLabels": null,
		      "privileged": null,
		      "name": "TechnicalTestImage"
		    }
		  ],
		  "placementConstraints": [],
		  "memory": null,
		  "taskRoleArn": null,
		  "compatibilities": [
		    "EC2"
		  ],
		  "taskDefinitionArn": "arn:aws:ecs:ap-southeast-2:708541441402:task-definition/TechnicalTestSolution:1",
		  "family": "TechnicalTestSolution",
		  "requiresAttributes": [
		    {
		      "targetId": null,
		      "targetType": null,
		      "value": null,
		      "name": "com.amazonaws.ecs.capability.ecr-auth"
		    }
		  ],
		  "requiresCompatibilities": null,
		  "networkMode": null,
		  "cpu": null,
		  "revision": 1,
		  "status": "ACTIVE",
		  "volumes": []
		}
      ```
   5. Create an **Amazon ECS cluster** that is running a service that uses the task defition that is created earlier.
   6. Setup Continious Integration using **AWS CodeBuild** web service, and this starts with creating a build specification file (**buildspec.yml**) and ensuring it is included in my git codebase, the content of the file is shown below.
      ```
	     version: 0.2
		 phases:
		  pre_build:
		    commands:
		      - echo Logging in to Amazon ECR...
		      - aws --version
		      - $(aws ecr get-login --region $AWS_DEFAULT_REGION --no-include-email)
		      - REPOSITORY_URI=708541441402.dkr.ecr.ap-southeast-2.amazonaws.com/lsheng-ecr
		      - IMAGE_TAG=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
		 build:
		    commands:
		      - echo Build started on `date`
		      - echo Building the Docker image...          
		      - docker build -t $REPOSITORY_URI:latest .
		      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG
		 post_build:
		    commands:
		      - echo Build completed on `date`
		      - echo Pushing the Docker images...
		      - docker push $REPOSITORY_URI:latest
		      - docker push $REPOSITORY_URI:$IMAGE_TAG
		      - echo Writing image definitions file...
		      - printf '[{"name":"TechnicalTestImage","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json
		 artifacts:
		    files: imagedefinitions.json
      ```
   7. Create a **AWS codePipeline**. The main configuration to mention is below:
     * Choose '**GitHub**' as the **Source Provider**, and specify the path to my GitHub repository.
     * Choose '**AWS CodeBuild**' for the build stage.
     * Choose '**Amazon ECS**' for **Deployment Provider**

  ### Once the pipeline is created, every code commit will trigger the deployment process, which is consist of 3 stages: Source, Build and Staging.