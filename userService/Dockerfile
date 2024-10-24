FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install nodemon globally (optional, but often helps)
RUN npm install -g nodemon

EXPOSE 5001

CMD ["npm", "run", "dev"]
