IMG_TAG="dex_service"

SERVER_ENTRY_PORT=1234
CONTAINER_PORT=7070
CLIENTS_PORT=7071
SERVICES=('rd')
PORTS=(7001 7002 7003)
ADDR="https://localhost"
PASSWORD=""

if [ "$PASSWORD" == "" ] ; then
  echo Create password:
  read -r -a PASS_ARRAY
  PASSWORD=${PASS_ARRAY[0]}
fi

npm run make

for ((i=0; i < ${#SERVICES[@]}; i++))
do
  docker build  --build-arg SERVICE_TYPE="${SERVICES[$i]}" \
                --build-arg CONTAINER_PORT=$CONTAINER_PORT \
                --build-arg PEER_PORT="${PORTS[$i]}"       \
                --build-arg CLIENTS_PORT=$CLIENTS_PORT     \
                --build-arg ADDR=$ADDR                     \
                --build-arg PASSWORD=$PASSWORD             \
                -t ${IMG_TAG}_"${SERVICES[$i]}"            \
                ./
done


docker run -d --name "${SERVICES[0]}" --publish ${PORTS[0]}:$CONTAINER_PORT --publish ${SERVER_ENTRY_PORT}:${CLIENTS_PORT}  ${IMG_TAG}_"${SERVICES[0]}"
docker run -d --name "${SERVICES[1]}" --publish ${PORTS[1]}:$CONTAINER_PORT                                       ${IMG_TAG}_"${SERVICES[1]}"
docker run -d --name "${SERVICES[2]}" --publish ${PORTS[2]}:$CONTAINER_PORT                                       ${IMG_TAG}_"${SERVICES[2]}"