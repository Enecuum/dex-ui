IMG_TAG="dex_service"

SERVER_ENTRY_PORT=80
CLIENTS_PORT=7071
SERVICES=('rd' 'fl' 'ddl')
PORTS=(7001 7002 7003)
SUBNET='172.18.0.0/16'
ROOT_IP='172.18.0.5'
NET="dex-ui_net"
PASSWORD=""

warn="\033[31m"
help="\033[32m"
end="\e[0m"


function help_msg() {
    echo -e "$help Args: --build $end"
    echo -e "$help       --run   $end"
}

function build_images() {
    for ((i=0; i < ${#SERVICES[@]}; i++))
    do
      docker build  --build-arg SERVICE_TYPE="${SERVICES[$i]}" \
                    --build-arg CONTAINER_PORT=${PORTS[$i]}    \
                    --build-arg PEER_PORT="${PORTS[0]}"        \
                    --build-arg CLIENTS_PORT=$CLIENTS_PORT     \
                    --build-arg ADDR=https://${ROOT_IP}        \
                    --build-arg PASSWORD=$PASSWORD             \
                    -t ${IMG_TAG}_"${SERVICES[$i]}"            \
                    ./
    done
}

function run_images() {
    docker run -d --name "${SERVICES[0]}"                         \
                  --publish ${PORTS[0]}:${PORTS[0]}               \
                  --publish ${SERVER_ENTRY_PORT}:${CLIENTS_PORT}  \
                  --net=${NET}                                    \
                  --ip ${ROOT_IP}                                 \
                  ${IMG_TAG}_"${SERVICES[0]}"
    sleep 5
    docker run -d --name "${SERVICES[1]}"           \
                  --publish ${PORTS[1]}:${PORTS[1]} \
                  --net=${NET}                      \
                  ${IMG_TAG}_"${SERVICES[1]}"
    sleep 5
    docker run -d --name "${SERVICES[2]}"           \
                  --publish ${PORTS[2]}:${PORTS[2]} \
                  --net=${NET}                      \
                  ${IMG_TAG}_"${SERVICES[2]}"
}

function clear_all() {
    docker stop $(docker ps -a -q) || echo "no containers"
    docker rm $(docker ps -a -q) || echo "no containers"
    docker network rm ${NET}|| echo "network has already been deleted"
    docker volume prune -f
}

# =================================== ===================================

if [ -z "$1" ] ; then
  echo -e "$warn There must be one argument $end"
  help_msg
  exit
fi

if [ "$1" == "--build" ] ; then
    if [ "$PASSWORD" == "" ] ; then
      echo Create password:
      read -r -a PASS_ARRAY
      PASSWORD=${PASS_ARRAY[0]}
    fi
    clear_all
    cp config.json.example config.json || echo "config has already been created"
    npm run make
    npm i
    docker network create --subnet=${SUBNET} ${NET}
    build_images
elif [ "$1" == "--run" ] ; then
    run_images
fi