# Use a lightweight Node.js image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Install nodemon globally (optional, but often helps)
RUN npm install -g nodemon

# Install ts-node globally (optional but helpful for dev)
RUN npm install -g ts-node

# Expose the port your app runs on
EXPOSE 5003

# Define the command to run your app using ts-node
CMD ["npm", "run", "dev"]
