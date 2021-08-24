#!/bin/bash

function delete_files_folders() {
    USELESS_PATHS=$1
    for ((i=0; i < ${#USELESS_PATH[@]}; i++))
    do
      rm -rf "${USELESS_PATH[$i]}" || echo `echo ${USELESS_PATH[$i]}` has already deleted
    done
    return 0
}

cd ..

MUST_BE_DELETED=('assets' 'data' 'doc_img' 'logs' '.gitignore' '.gitmodules' 'config.json' 'README.md')
delete_files_folders MUST_BE_DELETED

if [ "$2" == "rd" ]; then
    MUST_BE_DELETED=('server/routers' 'server/services/DexDataLoader.js' 'server/services/FileLoader.js')
elif [ "$2" == "fl" ]; then
    MUST_BE_DELETED=('server/services/DexDataLoader.js' 'server/services/RequestsDivisor.js')
elif [ "$2" == "ddl" ]; then
    MUST_BE_DELETED=('server/routers' 'server/services/RequestsDivisor.js' 'server/services/FileLoader.js')
fi
delete_files_folders MUST_BE_DELETED