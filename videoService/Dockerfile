# Use Node.js 18 Alpine image as the base image
FROM node:20.12.2

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./ 

# Install Node.js dependencies
RUN npm install


# Install FFmpeg from Alpine package manager (apk)
RUN apt-get update && apt-get install -y ffmpeg





# Install nodemon globally (optional, but often helps for development)
RUN npm install -g nodemon


# Install ts-node globally (optional but helpful for dev)
RUN npm install -g ts-node




# Copy the rest of your application code
COPY . .






# Expose the port your app runs on
EXPOSE 5002

# Define the command to run your app (using dev script)
CMD ["npm", "run", "dev"]
