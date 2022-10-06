# Node image
FROM node:slim

# Create directory for server node.js files
WORKDIR /app

# Copy all project files except ignored in .dockerignore
ADD . /app

# Upgrade all system dependencies
RUN apt-get update && apt-get upgrade -y

ENV NODE_ENV production

# Install pm2 and project dependencies
RUN mv config.json.example config.json
RUN npm install pm2 -g
RUN apt-get update && apt-get install -y git
RUN npm i --force
RUN npx webpack-cli build --config webpack.config.js
RUN rm -rf node_modules
RUN npm install --production

# point out ports
EXPOSE 7000-8000

ENV SERVICE_TYPE    rd
ENV PEER_HOST       https://0.0.0.0
ENV PEER_PORT       7001
ENV CONTAINER_PORT  7071
ENV PASSWORD        root
ENV OPENED_PORT     80

CMD cd server/scripts/ ;\
if [ "$SERVICE_TYPE" = "rd" ] ; then \
    pm2-runtime start rd.js -- --peer ${PEER_HOST}:${PEER_PORT} --port ${CONTAINER_PORT} --p ${PASSWORD} --o_port ${OPENED_PORT} ;\
elif [ "$SERVICE_TYPE" = "fl" ] ; then \
    pm2-runtime start fl.js -- --peer ${PEER_HOST}:${PEER_PORT} --port ${CONTAINER_PORT} --p ${PASSWORD} ;\
elif [ "$SERVICE_TYPE" = "ddl" ] ; then \
    pm2-runtime start ddl.js -- --peer ${PEER_HOST}:${PEER_PORT} --port ${CONTAINER_PORT} --p ${PASSWORD} ;\
fi
