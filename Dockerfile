# Node image
FROM node:slim

# Create directory for server node.js files
WORKDIR /app

# Copy all project files except ignored in .dockerignore
ADD . /app

# Establish args
ARG SERVICE_TYPE
ARG CONTAINER_PORT
ARG PEER_PORT
ARG CLIENTS_PORT
ARG ADDR
ARG PASSWORD

# Upgrade all system dependencies
RUN apt-get update && apt-get upgrade -y

# Install pm2 and project dependencies
RUN npm install pm2 -g

# remove useless files
#RUN bash remove_useless_files.bash --stype $SERVICE_TYPE

# point out ports
EXPOSE $CONTAINER_PORT
EXPOSE $CLIENTS_PORT

ENV S_TYPE  $SERVICE_TYPE
ENV ADDRESS $ADDR
ENV P_PORT  $PEER_PORT
ENV C_PORT  $CONTAINER_PORT
ENV PASSW   $PASSWORD
ENV O_PORT  $CLIENTS_PORT

CMD cd server/scripts/ ;\
if [ "$S_TYPE" = "rd" ] ; then \
    pm2-runtime start rd.js -- --peer ${ADDRESS}:${P_PORT} --port ${C_PORT} --p ${PASSW} --o_port ${O_PORT} ;\
elif [ "$S_TYPE" = "fl" ] ; then \
    pm2-runtime start fl.js -- --peer ${ADDRESS}:${P_PORT} --port ${C_PORT} --p ${PASSW} ;\
elif [ "$S_TYPE" = "ddl" ] ; then \
    pm2-runtime start ddl.js -- --peer ${ADDRESS}:${P_PORT} --port ${C_PORT} --p ${PASSW} ;\
fi