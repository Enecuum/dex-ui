IMG_TAG="dex_service"

SERVER_ENTRY_PORT=1234
CLIENTS_PORT=7071
SERVICES=('rd' 'fl' 'ddl')
PORTS=(7001 7002 7003)
SUBNET='172.18.0.0/16'
ROOT_IP='172.18.0.5'
NET="dex-ui_net"
PASSWORD=""

if [ "$PASSWORD" == "" ] ; then
  echo Create password:
  read -r -a PASS_ARRAY
  PASSWORD=${PASS_ARRAY[0]}
fi

mv config.json.example config.json || echo "config has already been created"

npm run make

docker network rm ${NET}|| echo "network has already been deleted"
docker stop $(docker ps -a -q) || echo "no containers"
docker rm $(docker ps -a -q) || echo "no containers"
docker volume prune -f

docker network create --subnet=${SUBNET} ${NET}

for ((i=0; i < ${#SERVICES[@]}; i++))
do
  docker build  --build-arg SERVICE_TYPE="${SERVICES[$i]}" \
                --build-arg CONTAINER_PORT=${PORTS[$i]}    \
                --build-arg PEER_PORT="${PORTS[0]}"        \
                --build-arg CLIENTS_PORT=$CLIENTS_PORT     \
                --build-arg ADDR=https://${ROOT_IP}           \
                --build-arg PASSWORD=$PASSWORD             \
                -t ${IMG_TAG}_"${SERVICES[$i]}"            \
                ./
done

docker run -d --name "${SERVICES[0]}" \
              --publish ${PORTS[0]}:${PORTS[0]} \
              --publish ${SERVER_ENTRY_PORT}:${CLIENTS_PORT}  \
              --net=${NET} \
              --ip ${ROOT_IP} \
              ${IMG_TAG}_"${SERVICES[0]}"
sleep 5
docker run -d --name "${SERVICES[1]}" \
              --publish ${PORTS[1]}:${PORTS[1]} \
              --net=${NET} \
              ${IMG_TAG}_"${SERVICES[1]}"
sleep 5
docker run -d --name "${SERVICES[2]}" \
              --publish ${PORTS[2]}:${PORTS[2]} \
              --net=${NET} \
              ${IMG_TAG}_"${SERVICES[2]}"