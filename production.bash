IMG_TAG="dex-ui"

SERVER_ENTRY_PORT=80
CLIENTS_PORT=7071
# Services (rd - request divisor, fl - file loader, ddl - dex data loader (not implemented))
SERVICES=('rd' 'fl' 'ddl')
PORTS=(7001 7002 7003)
SUBNET='172.18.0.0/16'
ROOT_IP='172.18.0.5'
NET="dex-ui_net"
NODE_ENV=production

warn="\033[31m"
help="\033[32m"
end="\e[0m"

export NODE_ENV

function help_msg() {
    echo -e "$help Args: --build $end"
    echo -e "$help       --run   $end"
}

function build_images() {
    docker build -t ${IMG_TAG} ./
}

function run_images() {
    docker run -d --name "${SERVICES[0]}"                         \
                  --publish ${PORTS[0]}:${PORTS[0]}               \
                  --publish ${SERVER_ENTRY_PORT}:${CLIENTS_PORT}  \
                  --net=${NET}                                    \
                  --ip ${ROOT_IP}                                 \
                  -e SERVICE_TYPE="${SERVICES[0]}"                \
                  -e CONTAINER_PORT="${PORTS[0]}"                 \
                  -e OPENED_PORT="${CLIENTS_PORT}"                \
                  ${IMG_TAG}
    
    for ((i=1; i < ${#SERVICES[@]}; i++))
    do
        sleep 5
        docker run -d --name "${SERVICES[$i]}"                    \
                      --publish ${PORTS[$i]}:${PORTS[$i]}         \
                      --net=${NET}                                \
                      -e SERVICE_TYPE="${SERVICES[$i]}"           \
                      -e CONTAINER_PORT="${PORTS[$i]}"            \
                      -e PEER_HOST=https://${ROOT_IP}             \
                      -e PEER_PORT="${PORTS[0]}"                  \
                      ${IMG_TAG}
    done
}

function clear_all() {
    docker stop $(docker ps -a -q) || echo "no containers"
    docker rm $(docker ps -a -q) || echo "no containers"
    docker network rm ${NET}|| echo "network has already been deleted"
    docker volume prune -f
}

# =================================== =================================== #

if [ -z "$1" ] ; then
  echo -e "$warn There must be one argument $end"
  help_msg
  exit
fi

if [ "$1" == "--build" ] ; then
    cp config.json.example config.json || echo "config has already been created"
    node node_modules/webpack/bin/webpack.js build --config webpack.config.js
    build_images
elif [ "$1" == "--run" ] ; then
    if [ -n "$2" ] ; then
        IMG_TAG=$2
    fi
    docker network create --subnet=${SUBNET} ${NET}
    run_images
elif [ "$1" == "--clear" ] ; then
    clear_all
fi