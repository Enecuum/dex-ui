# Node image
FROM node:slim

# Create directory for server node.js files
WORKDIR /app

# Copy all project files except ignored in .dockerignore
ADD . /app

# Upgrade all system dependencies
RUN apt update && apt upgrade

# Install pm2 and project dependencies
RUN npm i
RUN npm install pm2 -g

RUN cd server_v2 && pm2 start testServiceFile.js -- --root --port 1234
